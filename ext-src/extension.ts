import * as path from "path";
import * as vscode from "vscode";
import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  window,
} from "vscode";
import {
  postDataStream,
  createConvId,
  converseStream,
  getPubCol,
} from "../src/api/entailment";
import * as express from "express";
import { Server } from "socket.io";
import * as http from "http";
import axios from "axios";
import * as FormData from "form-data";
import * as cors from "cors"
import { URLS } from "../config/propelauth";
const router = express.Router();

export function activate(context: vscode.ExtensionContext) {
  //@ts-ignore
  const app = express();

  const server = http.createServer(app);

  const client_secret = vscode.workspace.getConfiguration().get("propelauth.clientSecret");

  const client_id = vscode.workspace.getConfiguration().get("propelauth.clientId");

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  //@ts-ignore
  app.use(cors());

  app.use((req: any, res: any, next: any)=> { 
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    next(); 
  })

  router.get("/auth/refresh", async (req, res) => {
    try {
      const user: any = context.globalState.get("user");
      if(user) {
        const response = await axios.post(URLS.refresh_token, {
          refresh_token: user.refresh_token
        })
        context.globalState.update("user", {...user, ...response.data})
      }
    } catch(e: any) {
      console.log("refresh error", e);
      context.globalState.update("user", undefined)
    }
    res.send()
  });

  router.get("/logout", async (req, res) => {
    try {
      const user: any = context.globalState.get("user");
      if(user) {
        await axios.post(URLS.logout, {
          refresh_token: user.refresh_token
        })
        context.globalState.update("user", undefined)
      }
    } catch(e: any) {
      console.log("logout error", e);
      context.globalState.update("user", undefined)
    }
    res.send()
  });

  router.get("/auth", async (req, res) => {
    res.redirect(
      `${URLS.login}?state=${req.query.socketId}&redirect_uri=${URLS.redirect_uri}&client_id=${client_id}&response_type=code`,
    );
  });

  router.get("/auth/callback", async (req, res) => {

    const { code, state: socketId }: any = req.query;

    try {

      let base64Key = Buffer.from(`${client_id}:${client_secret}`)
        .toString("base64")
        .replace(/(\r\n|\n|\r)/gm, "");

      const response: any = await axios
        .post(
          URLS.oauth_token,
          new URLSearchParams({
            code: code,
            grant_type: "authorization_code",
            redirect_uri: URLS.redirect_uri,
          }),
          {
            headers: {
              Authorization: `Basic ${base64Key}`,
            },
          },
        )

        const user: any = await axios
          .get(URLS.userinfo, {
            headers: { Authorization: `Bearer ${response.data.access_token}`},
          })
          .catch((e: any) => console.log(e));

        res.set("Content-Security-Policy default-src ; style-src 'self' http:// 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'").send(`<script>window.open('', '_self', ''); window.close();</script>`);

        if (!socketId) {
          return;
        }

        context.globalState.update("user", {...user.data, ...response.data})

        io.in(socketId).emit("auth", { user: {...user.data, ...response.data} });
      } catch(e: any) {
        console.log("Login error", e)
        if(socketId) {
          io.in(socketId).emit("auth",  {error: "Something went wrong, please try again later"});
        }
      }
  });

  app.use("/", router);

  server.listen(3000);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "left-panel-webview",
      new ReactPanel(context.extensionPath, context, context?.extensionUri, {
        userInfo: {
          userId: "9a8d0554-9622-4a63-aa03-d46cd883692a",
          groupId: "2a395b97-2513-4588-b144-aa9949419934",
          org: "Entailment AI",
        },
      }),
      {
        webviewOptions: { retainContextWhenHidden: true },
      },
    ),
  );
}

/**
 * Manages react webview panels
 */
class ReactPanel implements WebviewViewProvider {
  constructor(
    private _extensionPath: any,
    private context: any,
    private readonly _extensionURI: Uri,
    private data: any,
    private _view: any = null,
  ) {}

  private onDidChangeTreeData: EventEmitter<any | undefined | null | void> =
    new EventEmitter<any | undefined | null | void>();

  pubsColData = [];

  refresh(context: any): void {
    this.onDidChangeTreeData.fire(null);
    this._view.webview.html = this._getHtmlForWebview();
    this.refreshToken();
  }

  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    //@ts-ignore
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this._extensionPath, "build")),
      ],
    };

    getPubCol().then((pubsColData) => {
      this.pubsColData = pubsColData;
      this._view.webview.postMessage({
        command: "pubColsData",
        pubColsData: pubsColData,
      });
    });

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        // If the extension becomes visible
        webviewView.webview.postMessage({
          command: "pubColsData",
          pubColsData: this.pubsColData,
        });
      }
    });

    this._view = webviewView;
    https: webviewView.webview.html = this._getHtmlForWebview();
    this._view = webviewView;
    this.activateMessageListener();
    this.selectionListener();
    this.refreshToken();
  }

  refreshToken = () => {
    const user: any = this.context.globalState.get("user");
    if(user) {
      axios.get("http://localhost:3000/auth/refresh").then((res) => {
        this._view.webview.postMessage({ command: "auth", user: {...user, ...res.data}});
      })
    } else {
      this._view.webview.postMessage({ command: "auth", user: null})
    }
  }

  selectionListener = () => {
    vscode.window.onDidChangeTextEditorSelection(
      this.handleTextSelectionChange,
    );
  };

  handleTextSelectionChange = () => {
    const editor = vscode.window.activeTextEditor;
    const selection = editor?.selection;
    let fileExtension = editor?.document.fileName.split(".").pop();

    //Need to find and add other possibilities
    if (fileExtension === "json") {
      fileExtension = "js";
    }

    let highlighted = "";
    if (selection && !selection.isEmpty) {
      const selectionRange = new vscode.Range(
        selection.start.line,
        selection.start.character,
        selection.end.line,
        selection.end.character,
      );
      highlighted = editor?.document.getText(selectionRange);
    }

    this._view.webview.postMessage({
      command: "handleSelect",
      text: highlighted
        ? "```" + fileExtension + "\n" + highlighted + "\n```"
        : "",
    });
  };

  private async activateMessageListener() {
    let packageDeps = "";
    let usePackageDeps = false;
    const storage = {
      getItem: (key: any) => this.context.globalState.get(key),
      setItem: (key: any, value: any) =>
        this.context.globalState.update(key, value),
      removeItem: (key: any) => this.context.globalState.update(key, undefined),
    };

    if (vscode.workspace.rootPath) {
      const filePath = path.join(vscode.workspace.rootPath, "package.json");

      if (filePath) {
        try {
          vscode.workspace.openTextDocument(filePath).then((document) => {
            packageDeps = document.getText();
          });
        } catch (e: any) {
          console.log(e);
        }
      }
    }

    let stream: any;
    let msg = "";
    this._view.webview.onDidReceiveMessage(async (message: any) => {
      const editor = vscode.window.activeTextEditor;
      const selection = editor?.selection;

      function getDocumentIdsByGroupId(data: any, groupId: any) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].documentGroupId === groupId) {
            return data[i].documentIds;
          }
        }
        return null; // return an empty array if no matching groupId is found
      }

      if (message.command === "auth") {
        vscode.env.openExternal(
          vscode.Uri.parse(
            `http://localhost:3000/auth?socketId=${message.socketId}`,
          ),
        );
      }

      if (message.command === "closeStream") {
        if (stream) {
          stream.destroy();
          this._view.webview.postMessage({
            isEnd: true,
            command: "handleResponse",
            text: msg,
          });
        }
      }

      if (message.command === "sendMessage") {
        this._view.webview.postMessage({
          command: "handleSend",
          text: message.text,
          prompt: message.prompt,
        });
        let res;
        if (message.prompt === "Lib") {
          const docIds = getDocumentIdsByGroupId(this.pubsColData, message.val);
          if (docIds) {
            const convId = await createConvId(
              this.data.userInfo["groupId"],
              this.data.userInfo["userId"],
              {
                document_ids: docIds,
                document_group_ids: [message.val],
              },
            );
            this.data["convId"] = convId;
            let newAnswer = true;
            msg = "";
            stream = converseStream(convId, message.text);
            stream.on("data", (json: any) => {
              const token = json;
              // const token = json["text"];
              if (token) {
                msg += token;
              }
              this._view.webview.postMessage({
                isEnd: false,
                command: "handleResponse",
                newAnswer: newAnswer,
                text: msg,
                question: message.text,
                prompt: message.prompt,
                val: message.val,
              });
              newAnswer = false;
            });
            stream.on("error", (err: any) => {
              console.error(err);
            });
            stream.on("end", () => {
              this._view.webview.postMessage({
                isEnd: true,
                command: "handleResponse",
                text: msg,
              });
              console.log("Stream ended");
            });
          }
        } else {
          let newAnswer = true;
          msg = "";
          stream = postDataStream(message.prompt, message.text);
          stream.on("data", (json: any) => {
            const token = json["text"];
            if (token) {
              msg += token;
            }
            this._view.webview.postMessage({
              isEnd: false,
              command: "handleResponse",
              newAnswer: newAnswer,
              text: msg,
              question: message.text,
              prompt: message.prompt,
              val: message.val,
            });
            newAnswer = false;
          });
          stream.on("error", (err: any) => {
            console.error(err);
          });
          stream.on("end", () => {
            this._view.webview.postMessage({
              isEnd: true,
              command: "handleResponse",
              text: msg,
            });
            msg = "";
            console.log("Stream ended");
          });
          // res = await postData(message.prompt, message.text);
        }

        // this._view.webview.postMessage({
        //   command: "handleResponse",
        //   text: res,
        //   question: message.text,
        //   prompt: message.prompt,
        //   val: message.val,
        // });
      }

      if (message.command === "selectText") {
        let highlighted = "";
        let fileExtension = editor?.document.fileName.split(".").pop();

        if (fileExtension === "json") {
          fileExtension = "js";
        }

        if (selection && !selection.isEmpty) {
          const selectionRange = new vscode.Range(
            selection.start.line,
            selection.start.character,
            selection.end.line,
            selection.end.character,
          );
          highlighted = editor?.document.getText(selectionRange);
        }
        this._view.webview.postMessage({
          command: "handleSelect",
          text: highlighted
            ? "```" + fileExtension + "\n" + highlighted + "\n```"
            : "",
        });
      }
      if (message.command === "useProjectDeps") {
        if (message.text) {
          usePackageDeps = true;
        } else {
          usePackageDeps = false;
        }
      }
    });
  }

  private static readonly viewType = "react";

  private _getHtmlForWebview() {
    const manifest = require(path.join(
      this._extensionPath,
      "build",
      "asset-manifest.json",
    ));
    const mainScript = manifest.files["main.js"];
    const mainStyle = manifest.files["main.css"];

    const scriptPathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "build", mainScript),
    );
    const scriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });
    const stylePathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "build", mainStyle),
    );
    const styleUri = stylePathOnDisk.with({ scheme: "vscode-resource" });

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>React App</title>
				<link rel="stylesheet" type="text/css" href="${styleUri}">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src self * 'unsafe-inline' blob: data: gap:; img-src * 'self' data: https:;  script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
				<base href="${vscode.Uri.file(path.join(this._extensionPath, "build")).with({
          scheme: "vscode-resource",
        })}/">
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
