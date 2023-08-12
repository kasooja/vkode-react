import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "./CodeBlock";
import { MemoizedReactMarkdown } from "./Markdown";
import { Text } from "@chakra-ui/react";

export function ChatMessage(message: any, ...props: any) {

  return (
    <div className={``}>
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return (
                <Text
                  className="mb-1 last:mb-0"
                  color={"text.200"}
                >
                  {children}
                </Text>
              );
            },
            code({ node, inline, className, children, ...props }: any) {
              if (children.length) {
                if (children[0] == "▍") {
                  return <span className="mt-1 animate-pulse cursor-default">▍</span>;
                }

                children[0] = children[0].replace("`▍`", "▍");
              }

              const match = /language-(\w+)/.exec(className || "");

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ""}
                  value={String(children).replace(/\n$/, "")}
                  {...props}
                />
              );
            },
          }}
        >
          {message.message}
        </MemoizedReactMarkdown>
    </div>
  );
}