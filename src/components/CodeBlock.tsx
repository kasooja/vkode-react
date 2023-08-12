"use client";

import { FC, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useCopyToClipboard } from "../hooks/useCopyToClipBoard";
import { Box, Button, Icon, Text, Tooltip } from "@chakra-ui/react";
import { BiCheck, BiCopy, BiDownload } from "react-icons/bi";

// interface Props {
//   language: string
//   value: string
// }

export const programmingLanguages: any = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css",
  // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
};

export const generateRandomString = (length: any, lowercase = false) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXY3456789"; // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return lowercase ? result.toLowerCase() : result;
};

const CodeBlock = memo(({ language, value }: any) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard(value);
  };

  return (
    // <div style={{ width: "100%", textAlign: "center" }}>
    <Box fontSize={"12px"} color={"text.200"} position={"relative"} overflowX={"scroll"}>
      <Box display={"flex"} paddingY={"0.5rem"} alignItems={"center"} justifyContent={"space-between"}>
        <Text fontSize={"12px"} color={"text.200"}>{language}</Text>
        <Box transition={"all 0.25s"} cursor={"pointer"} onClick={onCopy} color={"text.200"} _hover={{ color: "text.200" }}>
          {isCopied ? (
              <Box color={"green.400"}>
                  <BiCheck fontSize={"1rem"} />
              </Box>
          ) : (
            <Tooltip label='Copy Code'>
              <Box>
                <BiCopy />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>

      <SyntaxHighlighter
        language={language}
        style={coldarkDark}
        PreTag="div"
        showLineNumbers
        customStyle={{
          margin: "0 auto",
          background: "black",
          padding: "1.5rem 1rem",
          overflow: "scroll",
          borderRadius: "0.325rem"
        }}
        codeTagProps={{
          style: {
            fontSize: "12px",
          },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </Box>
    // </div>
  );
});
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };