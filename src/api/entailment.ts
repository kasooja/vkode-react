import axios from "axios";
import { Readable } from "stream";

export async function getPubCol() {
  const response = await axios.post(
    "https://app.entailment.ai/api/get_pub_col",
    { ENV: "prod", accesToken: "N/A" },
  );
  const collections = response.data;
  return collections;
}

export async function converse(conversationId: string, message: string) {
  const data = {
    ENV: "prod",
    conversationId: conversationId,
    message: message,
    accessToken: "N/A",
    use_external: false,
  };
  const response = await axios.post(
    "https://app.entailment.ai/api/converse",
    data,
    {
      responseType: "stream",
    },
  );

  let partialData = "";
  let untilNowResponse = "";
  return new Promise((resolve, reject) => {
    response.data.on("data", (chunk: any) => {
      const chunkStr = chunk.toString();
      partialData += chunkStr;
      const separator = "7BPc8gjai9d";
      const separatorIndex = partialData.indexOf(separator);
      if (separatorIndex >= 0) {
        const completeMessage = partialData.substring(0, separatorIndex);
        partialData = partialData.substring(separatorIndex + separator.length);
        try {
          const data = JSON.parse(completeMessage);
          if (data.sender === "bot") {
            if (data.type === "start") {
            } else if (data.type === "stream") {
              const botReplyChunk = data.message;
              untilNowResponse += botReplyChunk;
            } else if (data.type === "info") {
            } else if (data.type === "end") {
            } else if (data.type === "error") {
            } else if (data.type === "knowledge_citations") {
            }
          }
        } catch (err) {
          console.error(`Error parsing JSON: ${err}`);
        }
      }
    });

    response.data.on("end", () => {
      console.log("end", partialData);
      console.log("No more data in response.");
      resolve(untilNowResponse);
    });
  });
}

export function converseStream(
  conversationId: string,
  message: string,
): Readable {
  const data = {
    ENV: "prod",
    conversationId: conversationId,
    message: message,
    accessToken: "N/A",
    use_external: false,
  };

  const readableStream = new Readable({
    objectMode: true,
    read() {},
  });

  axios
    .post("https://app.entailment.ai/api/converse", data, {
      responseType: "stream",
    })
    .then((response) => {
      let partialData = "";
      const separator = "7BPc8gjai9d";
      response.data.on("data", (chunk: any) => {
        const chunkStr = chunk.toString();
        partialData += chunkStr;
        const separatorIndex = partialData.indexOf(separator);
        if (separatorIndex >= 0) {
          const completeMessage = partialData.substring(0, separatorIndex);
          partialData = partialData.substring(
            separatorIndex + separator.length,
          );
          try {
            const data = JSON.parse(completeMessage);
            if (data.sender === "bot" && data.type === "stream") {
              const botReplyChunk = data.message;
              readableStream.push(botReplyChunk);
            }
          } catch (err) {
            console.error(`Error parsing JSON: ${err}`);
            readableStream.emit("error", err);
          }
        }
      });

      response.data.on("end", () => {
        // Handle any remaining partial message
        try {
          // if (partialData.trim()) {
          //   // Check if `partialData` is not an empty string
          //   const jsonData = JSON.parse(partialData);
          //   readableStream.push(jsonData);
          // }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
        readableStream.push(null); // Signal the end of data
      });

      response.data.on("error", (err: any) =>
        readableStream.emit("error", err),
      );
    })
    .catch((err) => readableStream.emit("error", err));

  return readableStream;
}

export async function createConvId(
  groupId: string,
  userId: string,
  docIds: any,
) {
  const response = await axios.post(
    "https://app.entailment.ai/api/create_conv_id",
    {
      ENV: "prod",
      groupId: groupId,
      userId: userId,
      accesToken: "N/A",
      docIds: docIds,
    },
  );

  const convId = response.data;
  return convId;
}

export async function postData(
  templateName: string,
  text: string,
): Promise<string> {
  const bytes = Buffer.from(text, "utf8").toString("base64");
  const source_text_body = {
    location: 2,
    textFileContent: {
      metaData: {
        filename: "",
        extension: "",
        fileType: 3,
        title: "",
        contentStructureFormat: 0,
      },
      data: bytes,
    },
    uri: "",
    resourceName: "",
    useUriIfExists: false,
  };
  const body = {
    template_name: templateName,
    template_params: {
      source_text: JSON.stringify(source_text_body),
      additional_text: "",
    },
    url: "",
    use_url: true,
    ENV: "prod",
  };

  const response = await axios.post(
    "https://app.entailment.ai/api/stream_writing",
    body,
    {
      responseType: "stream",
    },
  );

  return new Promise((resolve, reject) => {
    let decoder = new TextDecoder();
    let untilNowResponse = "";
    let totalResponse = "";

    response.data.on("data", (chunk: any) => {
      const text = decoder.decode(chunk, { stream: true });
      untilNowResponse += text;
      const jsonObjects = untilNowResponse.split("\n");
      if (jsonObjects.length) {
        untilNowResponse = jsonObjects.pop() as string;
      } else {
        untilNowResponse = "";
      }
      for (const jsonObject of jsonObjects) {
        try {
          const jsonData = JSON.parse(jsonObject);
          const token = jsonData.text;
          if (token) {
            // ensure token is not undefined before concatenating
            totalResponse += token;
            totalResponse = totalResponse.replace(/\n+/g, "\n");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    });

    response.data.on("end", () => {
      // Handle any remaining partial JSON object
      try {
        if (untilNowResponse.trim()) {
          // Check if `untilNowResponse` is not an empty string
          const jsonData = JSON.parse(untilNowResponse);
          const token = jsonData.text;
          if (token) {
            // ensure token is not undefined before concatenating
            totalResponse += token;
            totalResponse = totalResponse.replace(/\n+/g, "\n");
          }
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }

      resolve(totalResponse);
    });

    response.data.on("error", (err: any) => reject(err));
  });
}

export function postDataStream(templateName: string, text: string): Readable {
  // const bytes = btoa(text);
  const bytes = Buffer.from(text, "utf8").toString("base64");

  const source_text_body = {
    location: 2,
    textFileContent: {
      metaData: {
        filename: "",
        extension: "",
        fileType: 3,
        title: "",
        contentStructureFormat: 0,
      },
      data: bytes,
    },
    uri: "",
    resourceName: "",
    useUriIfExists: false,
  };
  const body = {
    template_name: templateName,
    template_params: {
      source_text: JSON.stringify(source_text_body),
      additional_text: "",
    },
    url: "",
    use_url: true,
    ENV: "prod",
  };

  const readableStream = new Readable({
    objectMode: true,
    read() {},
  });

  axios
    .post("https://app.entailment.ai/api/stream_writing", body, {
      responseType: "stream",
    })
    .then((response) => {
      let decoder = new TextDecoder();
      let untilNowResponse = "";

      response.data.on("data", (chunk: any) => {
        const text = decoder.decode(chunk, { stream: true });
        untilNowResponse += text;
        const jsonObjects = untilNowResponse.split("\n");
        if (jsonObjects.length) {
          untilNowResponse = jsonObjects.pop() as string;
        } else {
          untilNowResponse = "";
        }
        for (const jsonObject of jsonObjects) {
          try {
            const jsonData = JSON.parse(jsonObject);
            readableStream.push(jsonData);
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
      });

      response.data.on("end", () => {
        // Handle any remaining partial JSON object
        try {
          // if (untilNowResponse.trim()) {
          //   // Check if `untilNowResponse` is not an empty string
          //   const jsonData = JSON.parse(untilNowResponse);
          //   readableStream.push(jsonData);
          // }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }

        readableStream.push(null); // Signal the end of data
      });

      response.data.on("error", (err: any) =>
        readableStream.emit("error", err),
      );
    })
    .catch((err) => readableStream.emit("error", err));

  return readableStream;
}
