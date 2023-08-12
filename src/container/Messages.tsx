import React, { useEffect, useRef } from "react"
import { Box, Text, Tooltip, useEditable } from "@chakra-ui/react"
import { MdEdit } from "react-icons/md"
import { LiaUndoAltSolid } from "react-icons/lia"
import { vsCode } from "../utils/vsState"
import { BiCheck, BiCopy } from "react-icons/bi"
import { ChatMessage } from "../components/MarkdownResponse"
import { useCopyToClipboard } from "../hooks/useCopyToClipBoard"

type MessageType = "user" | "bot"

export interface IMessages {
    type: MessageType,
    message: string,
    prompt: string,
    val: string,
    question: string
}

export const Messages = ({messages, setInput, isLoading}: {messages: IMessages[], setInput: (data: any) => void, isLoading: boolean}) => {
    
    const ref: any = useRef(null);

    const scrollToLastFruit = () => {
        const lastChildElement = ref.current?.lastElementChild;
        lastChildElement?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToLastFruit()
    }, [messages])

    return (
        <Box ref={ref} display="flex" overflowY={"auto"} flexGrow={1} flexDirection={"column"} style={{gap: "1rem"}} padding={"0.5rem"} marginTop="24px" flex="1">
            {
                messages.map(({type, message, question, prompt, val}) => 
                {
                    return (
                        type === "user" ? <Question message={message} question={question} setInput={setInput} /> : <Answer question={question} prompt={prompt} val={val} message={message} />
                    )
                })
            }
            {isLoading && <div className="loader"><div className="bounce1"></div><div className="bounce2"></div><div className="bounce3"></div></div>}
        </Box>
    )
}

const Question = ({message, question, setInput}: {message: string, question: string, setInput: (data: string) => void}) => {

    const onEdit = () => {
        setInput(message)
    }

    return (
        <Box display={"flex"} flexDirection={"column"} style={{gap: "0.25rem"}} >
            <Box display={"flex"} alignItems={"center"} color={"text.100"} justifyContent={"space-between"}>
                <Text color={"text.100"}>Question : {question}</Text>
                <Tooltip label='Edit Prompt'>
                    <Box transition={"all 0.25s"} cursor={"pointer"} onClick={onEdit} color={"text.100"} _hover={{ color: "text.200" }}>
                        <MdEdit />
                    </Box>
                </Tooltip>
            </Box>
            <Box background={"purple.400"} padding={"0.75rem 0.5rem"} display={"block"} borderRadius={"20px 20px 0.25rem 20px"}>
                <ChatMessage message={message} />
            </Box>
        </Box>
    )
}

const Answer = ({message, prompt, val, question}: {message: string, question: string, prompt: string, val: string}) => {

    const onRegenerate = () => {
        vsCode.postMessage({ command: 'sendMessage', text: question, prompt: prompt, val: val });
    }

    const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

    const onCopy = () => {
        if (isCopied) return;
        copyToClipboard(message);
    };

    return (
        <Box display={"flex"} flexDirection={"column"} style={{gap: "0.25rem"}} >
            <Box display={"flex"} alignItems={"center"} color={"text.100"} justifyContent={"space-between"}>
                <Text color={"text.100"}>Answer : </Text>
                <Box  display={"flex"} alignItems={"center"} style={{gap: "0.5rem"}}>
                    <Tooltip label='Regenerate Response'>
                        <Box transition={"all 0.25s"} cursor={"pointer"} onClick={onRegenerate} color={"text.100"} _hover={{ color: "text.200" }}>
                            <LiaUndoAltSolid />
                        </Box>
                    </Tooltip>
                    {isCopied ? (
                        <Box color={"green.400"}>
                            <BiCheck fontSize={"1rem"} />
                        </Box>
                    ) : (
                        <Tooltip label='Copy'>
                            <Box>
                                <BiCopy cursor={"pointer"} onClick={onCopy} />
                            </Box>
                        </Tooltip>
                    )}
                </Box>
            </Box>
            <Box background={"black.800"} padding={"0.75rem 0.5rem"} display={"block"} borderRadius={"20px 20px 20px 0.25rem"}>
                <ChatMessage message={message} />
            </Box>
        </Box>
    )
}