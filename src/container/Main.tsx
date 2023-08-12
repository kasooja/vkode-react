import {
  Box,
  Button,
  Divider,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Text,
  Textarea,
  Tooltip,
  background,
  useRadioGroup,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import MainContextWrapper from "./MainContext";
import { vsCode } from "../utils/vsState";
import { IMessages, Messages } from "./Messages";
import { BsBack, BsCardChecklist, BsSendFill } from "react-icons/bs";
import { BiChevronDown, BiCodeAlt, BiLogOut, BiUser } from "react-icons/bi";
import { RiArrowGoBackLine } from "react-icons/ri";
import autosize from "autosize";
import { RadioCard } from "../components/RadioCard";
import { PiChatTeardropTextLight } from "react-icons/pi";
import { IoArrowBackSharp, IoHammer, IoSettings } from "react-icons/io5";
import { LuFileCode } from "react-icons/lu";
import { LiaProjectDiagramSolid } from "react-icons/lia";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { HiOutlineStopCircle } from "react-icons/hi2";

export default function Main({user, handleLogout, pubColsData}: any) {

  const [messages, setMessages] = useState<IMessages[]>([]);
  const [text, setText] = useState("");
  const [isLoader, setIsLoader] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [template, setTemplate] = useState("");
  const [connector, setConnector] = useState("");
  const [connectorType, setConnectorType] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [prompt, setPrompt] = useState("prompt_add_comments");
  const [method, setMethod] = useState("tasks");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.addEventListener("message", (event) => handleMessage(event));
  }, []);

  const handleMessage = (event: any) => {
    const message = event.data; // The JSON data our extension sent
    // const htmlContent = marked.parse(message.text);
    switch (message.command) {
      case "handleSend":
        let question = "";
        switch (message.prompt) {
          case "prompt_add_comments":
            question = "Add Comments";
            break;
          case "prompt_test_cases":
            question = "Test Cases";
            break;
          case "prompt_fix_code":
            question = "Fix Code";
            break;
          case "prompt_write_code":
            question = "Write Code";
            break;
          case "prompt_tech_spec":
            question = "Technical Doc";
            break;
          case "prompt_design_diagram":
            question = "System Diagram";
            break;
          case "Lib":
            question = "Lib/Dep";
            break;
        }
        setMessages((messages) => [
          ...messages,
          {
            type: "user",
            message: message.text,
            question,
            prompt: message.prompt,
            val: message.val,
          },
        ]);
        break;
      case "handleResponse":
        if (message.isEnd) {
          setIsSending(false);
          return;
        }
        setMessages((prev: any) => {
          if (message.newAnswer) {
            return [
              ...prev,
              {
                type: "bot",
                message: message.text,
                prompt: message.prompt,
                val: message.val,
                question: message.question,
              },
            ];
          } else {
            let oldMessages = prev;
            oldMessages[prev.length - 1]["message"] = message.text;
            return [...oldMessages];
          }
        });
        scroll();
        setIsLoader(false);
        break;
      case "handleSelect":
        setText(message.text);
        break;
    }
  };

  const sendMessage = () => {
    if (isSending || !text) {
      return;
    }
    setIsSending(true);
    setLastQuestion(text);
    // Call the callback function in the extension
    vsCode.postMessage({
      command: "sendMessage",
      text: text,
      prompt: prompt,
      val: template,
    });
    setText("");
    setIsLoader(true);
  };

  const ref: any = useRef(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    autosize(ref.current);
    return () => {
      if (!ref.current) {
        return;
      }
      autosize.destroy(ref.current);
    };
  }, []);

  const handleEnter = (e: any) => {
    if (!e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const options = ["tasks", "contexts", "workflows"];

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "Method",
    defaultValue: "tasks",
    onChange: (e) => setMethod(e),
  });

  const group = getRootProps();

  const tasks = [
    {
      name: "Add Comments",
      value: "prompt_add_comments",
      icon: <PiChatTeardropTextLight fontSize={"1.25rem"} />,
    },
    {
      name: "Test Cases",
      value: "prompt_test_cases",
      icon: <BsCardChecklist fontSize={"1.25rem"} />,
    },
    {
      name: "Fix Code",
      value: "prompt_fix_code",
      icon: <IoHammer fontSize={"1.25rem"} />,
    },
    {
      name: "Write Code",
      value: "prompt_write_code",
      icon: <LuFileCode fontSize={"1.25rem"} />,
    },
    {
      name: "Technical Doc",
      value: "prompt_tech_spec",
      icon: <HiOutlineDocumentSearch fontSize={"1.25rem"} />,
    },
    {
      name: "System Diagram",
      value: "system-diagram",
      icon: <LiaProjectDiagramSolid fontSize={"1.25rem"} />,
    },
  ];

  const connectors = [
    {
      name: "Database",
      values: [
        {
          name: "Supabase",
          value: "supabase_connector",
          icon: (
            <svg
              fontSize={"1.25rem"}
              xmlns="http://www.w3.org/2000/svg"
              width="1.25rem"
              height="1.25rem"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z"
              />
            </svg>
          ),
        },
        {
          name: "CouchDB",
          value: "couchdb",
          icon: (
            <svg
              fontSize={"1.25rem"}
              viewBox="0 -44 256 256"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              preserveAspectRatio="xMidYMid"
              width="1.25rem"
              fill="currentColor"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <g>
                  <path
                    d="M207.998979,111.999271 C207.998979,122.608868 202.410682,127.807501 191.999417,127.991833 L191.999417,127.998833 L64.0005833,127.998833 L64.0005833,127.991833 C53.5893178,127.807501 48.0010208,122.608868 48.0010208,111.999271 C48.0010208,101.392007 53.5893178,96.1910404 64.0005833,96.0090416 L64.0005833,95.9997083 L191.999417,95.9997083 L191.999417,96.0090416 C202.410682,96.1910404 207.998979,101.392007 207.998979,111.999271 M191.999417,136.009115 L191.999417,135.999781 L64.0005833,135.999781 L64.0005833,136.009115 C53.5893178,136.191113 48.0010208,141.392079 48.0010208,152.001677 C48.0010208,162.611275 53.5893178,167.807574 64.0005833,167.991906 L64.0005833,167.998906 L191.999417,167.998906 L191.999417,167.989573 C202.410682,167.807574 207.998979,162.608941 207.998979,151.999344 C207.998979,141.389746 202.410682,136.191113 191.999417,136.009115 M231.99949,48.0173541 L231.99949,48.0080208 C221.588224,48.1923529 215.999927,53.3909857 215.999927,64.0005833 L215.999927,151.999344 C215.999927,162.608941 221.588224,167.805241 231.99949,167.989573 L231.99949,167.97324 C247.616388,167.42491 256,151.826678 256,120.000219 L256,80.0001458 C256,58.783284 247.616388,48.3860183 231.99949,48.0173541 M24.0005104,48.0080208 L24.0005104,48.0173541 C8.38361209,48.3860183 0,58.783284 0,80.0001458 L0,120.000219 C0,151.826678 8.38361209,167.422577 24.0005104,167.97324 L24.0005104,167.989573 C34.411776,167.807574 40.0000729,162.608941 40.0000729,151.999344 L40.0000729,64.0005833 C40.0000729,53.3909857 34.411776,48.1923529 24.0005104,48.0080208 M231.99949,40.0000729 C231.99949,13.4772456 218.027581,0.480663537 191.999417,0.0209998633 L191.999417,0 L64.0005833,0 L64.0005833,0.0209998633 C37.9747528,0.480663537 24.0005104,13.4772456 24.0005104,40.0000729 L24.0005104,40.0140728 C39.6174087,40.2894044 48.0010208,48.0873536 48.0010208,64.0005833 C48.0010208,79.9138131 56.3846329,87.7117623 72.0015312,87.9870938 L72.0015312,87.9987604 L184.000802,87.9987604 L184.000802,87.9870938 C199.615367,87.7117623 207.998979,79.9138131 207.998979,64.0005833 C207.998979,48.0873536 216.382591,40.2894044 231.99949,40.0140728 L231.99949,40.0000729 Z"
                    fill="currentColor"
                    fill-rule="nonzero"
                  ></path>
                </g>
              </g>
            </svg>
          ),
        },
        {
          name: "Single Store",
          value: "singlestore_connector",
          icon: (
            <svg
              fontSize={"1.25rem"}
              fill="currentColor"
              role="img"
              viewBox="0 0 24 24"
              width="1.25rem"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.029 5.063c-.914-1.916-2.8-3.432-5.114-4.033C11.4.887 10.858.83 10.258.8c-.886 0-1.743.114-2.629.343-2.2.658-3.742 1.945-4.657 2.947C1.801 5.435 1.03 6.837.572 8.238c0 .029-.028.057-.028.115C.515 8.467.4 8.81.4 8.896c-.029.057-.029.143-.057.2l-.086.344c0 .028 0 .057-.028.086-.743 3.69.49 7.001 1.234 8.231.185.308.338.564.49.8C.27 9.403 5.116 5.035 10.63 4.92c2.886-.057 5.771 1.116 7.171 3.461-.086-1.287-.171-2.002-.771-3.318zM12.543 0c2.572.715 4.914 2.517 5.886 4.72 1.485 3.575 1.143 8.095-.486 10.784-1.371 2.203-3.485 3.375-5.914 3.347-3.771-.029-6.828-3.032-6.857-6.808 0-3.776 2.971-6.894 6.857-6.894.629 0 1.535.087 2.563.516 0 0-.739-.438-2.638-.732C6.497 4.218.058 8.353 1.544 17.878c2.057 3.662 6 6.15 10.485 6.122 6.6-.029 12-5.435 11.97-12.072C24 5.578 18.83.172 12.544 0z"></path>
            </svg>
          ),
        },
      ],
      icon: <PiChatTeardropTextLight fontSize={"1.25rem"} />,
    },
    {
      name: "API",
      value: (
        <Box 
          transition={"all 0.25s"}
          alignItems={"center"}
          cursor={"pointer"}
          display={"flex"}
          gap={"0.25rem"}
          flexDirection={"column"}
          _hover={{
            color: "Lib" === prompt ? "purple.500" : "text.200",
          }}
          color={"Lib" === prompt ? "purple.400" : "text.100"}
          onClick={() => setPrompt("Lib")}
          fontSize={"13px"}
        >
          <svg className="template-svg" width="1.25rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11 18C11 18.9319 11 19.3978 11.1522 19.7654C11.3552 20.2554 11.7446 20.6448 12.2346 20.8478C12.6022 21 13.0681 21 14 21H18C18.9319 21 19.3978 21 19.7654 20.8478C20.2554 20.6448 20.6448 20.2554 20.8478 19.7654C21 19.3978 21 18.9319 21 18C21 17.0681 21 16.6022 20.8478 16.2346C20.6448 15.7446 20.2554 15.3552 19.7654 15.1522C19.3978 15 18.9319 15 18 15H14C13.0681 15 12.6022 15 12.2346 15.1522C11.7446 15.3552 11.3552 15.7446 11.1522 16.2346C11 16.6022 11 17.0681 11 18ZM11 18H9.2C8.07989 18 7.51984 18 7.09202 17.782C6.71569 17.5903 6.40973 17.2843 6.21799 16.908C6 16.4802 6 15.9201 6 14.8V9M6 9H18C18.9319 9 19.3978 9 19.7654 8.84776C20.2554 8.64477 20.6448 8.25542 20.8478 7.76537C21 7.39782 21 6.93188 21 6C21 5.06812 21 4.60218 20.8478 4.23463C20.6448 3.74458 20.2554 3.35523 19.7654 3.15224C19.3978 3 18.9319 3 18 3H6C5.06812 3 4.60218 3 4.23463 3.15224C3.74458 3.35523 3.35523 3.74458 3.15224 4.23463C3 4.60218 3 5.06812 3 6C3 6.93188 3 7.39782 3.15224 7.76537C3.35523 8.25542 3.74458 8.64477 4.23463 8.84776C4.60218 9 5.06812 9 6 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
          <Text>Lib Context</Text>  
          <Select width={"10rem"} fontSize={"12px"} onChange={(e) => setTemplate(e.target.value)} background={"black.700"} _focus={{boxShadow: "none", border: "none", outline: "none"}} border={"none"} color={"text.200"} placeholder="Select Lib">
            {pubColsData.map(({name, value}: any) => (
              <option value={value}>{name}</option>
            ))}
          </Select>
        </Box>
      ),
      icon: <BsCardChecklist fontSize={"1.25rem"} />,
    },
    {
      name: "SAAS",
      value: [],
      icon: <IoHammer fontSize={"1.25rem"} />,
    },
    {
      name: "Cloud",
      value: [],
      icon: <LuFileCode fontSize={"1.25rem"} />,
    },
    {
      name: "Code",
      value: [],
      icon: <HiOutlineDocumentSearch fontSize={"1.25rem"} />,
    },
    {
      name: "Doc",
      value: [],
      icon: <LiaProjectDiagramSolid fontSize={"1.25rem"} />,
    },
  ];

  useEffect(() => {
    setIsOpen(false);
    setConnectorType("");
  }, [method]);

  const handleStop = () => {
    setIsSending(false);
    setIsLoader(false);
    vsCode.postMessage({ command: "closeStream" });
    if (messages[messages.length - 1].type === "user") {
      setMessages((prev) => {
        if (prev.length > 0) {
          return [...prev.splice(0, -1)];
        } else {
          return [...prev];
        }
      });
    }
  };

  return (
    <MainContextWrapper>
      {isSending && (
        <Box
          onClick={handleStop}
          padding={"10px 14px"}
          borderRadius={"0.325rem"}
          left={0}
          right={0}
          zIndex={10}
          background={"black.800"}
          bottom={"10rem"}
          cursor={"pointer"}
          margin={"auto"}
          width={"fit-content"}
          position={"absolute"}
          display={"flex"}
          gap={"0.25rem"}
          color={"text.100"}
          alignItems={"center"}
          _hover={{ color: "text.100" }}
        >
          <HiOutlineStopCircle fontSize={"1rem"} /> <Text>Stop Generating</Text>
        </Box>
      )}
      <Box
        background={"black.900"}
        h="100vh"
        overflow={"hidden"}
        display="flex"
        flexDirection="column"
      >
        <Box background={"black.900"} display={"flex"} justifyContent={"flex-end"}>
          <Menu>
            <MenuButton
              _hover={{background: "transparent", color: "text.200"}}
              _focus={{background: "transparent", color: "text.200"}}
              _active={{background: "transparent", color: "text.200"}}
              color={"text.100"}
              background={"transparent"}
              border={"none"}
              as={IconButton}
              aria-label='Options'
              icon={<IoSettings />}
              variant='outline'
            />
            <MenuList background={"black.700"} border={"none"}>
              <MenuItem color={"text.100"} background={"black.700"} transition={"all 0.25s"} _hover={{color: "text.200", background: "black.800"}} border={"none"} icon={<BiUser />}>
                {user.email}
              </MenuItem>
              <MenuItem onClick={handleLogout} background={"black.700"} color={"text.100"} transition={"all 0.25s"} border={"none"} _hover={{color: "text.200", background: "black.800"}} icon={<BiLogOut />}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <Box
          background={"black.800"}
          padding={"1rem 0.5rem"}
          display={"flex"}
          flexDirection={"column"}
        >
          <HStack padding={"0.5rem"} {...group}>
            {options.map((value) => {
              const radio = getRadioProps({ value });
              return (
                <RadioCard key={value} {...radio}>
                  {value.substring(0, 1).toUpperCase() + value.substring(1)}
                </RadioCard>
              );
            })}
          </HStack>
          <Box
            onClick={() => setIsOpen(!isOpen)}
            marginY={"1rem"}
            marginX={"auto"}
            _hover={{ color: "purple.500" }}
            cursor={"pointer"}
            alignItems={"center"}
            color={"purple.400"}
            display={"flex"}
            gap={"0.1rem"}
          >
            <Text transition={"all 0.25s"} fontWeight={600}>
              {method.substring(0, 1).toUpperCase() + method.substring(1)}
            </Text>
            <BiChevronDown
              style={{
                rotate: isOpen ? "180deg" : "0deg",
                transition: "all 0.25s",
              }}
              fontSize={"1.25rem"}
            />
          </Box>
          {method === "tasks" ? (
            <Box
              height={!isOpen ? "2.5rem" : "auto"}
              overflow={"hidden"}
              transition={"all 0.25s"}
              display={"flex"}
              flexWrap={"wrap"}
              gap={"1rem 0rem"}
            >
              {tasks.map(({ icon, name, value }) => (
                <Box
                  onClick={() => setPrompt(value)}
                  flex={"1 1 33.33%"}
                  transition={"all 0.25s"}
                  alignItems={"center"}
                  cursor={"pointer"}
                  display={"flex"}
                  gap={"0.25rem"}
                  flexDirection={"column"}
                  _hover={{
                    color: value === prompt ? "purple.500" : "text.200",
                  }}
                  color={value === prompt ? "purple.400" : "text.100"}
                >
                  {icon}
                  <Text>{name}</Text>
                </Box>
              ))}
            </Box>
          ) : method === "contexts" ? (
            <Box
              height={!isOpen && connectorType != "API"  ? "2.5rem" : "auto"}
              overflow={connectorType != "API" ? "hidden" : ""}
              transition={"all 0.25s"}
              display={"flex"}
              flexWrap={"wrap"}
              gap={"1rem 0rem"}
            >
              {connectors.map(({ icon, name, values, value }) => (
                <Connector
                  icon={icon}
                  name={name}
                  values={values}
                  value={value}
                  connector={connector}
                  setConnector={(data: any) => setConnector(data)}
                  connectorType={connectorType}
                  setConnectorType={(data: any) => {setConnectorType(data); setIsOpen(true)}}
                />
              ))}
            </Box>
          ) : (
            <Box>
              <Text fontWeight={600} color={"text.100"} textAlign={"center"}>
                Coming Soon..
              </Text>
            </Box>
          )}
        </Box>
        <Messages
          isLoading={isLoader}
          messages={messages}
          setInput={(data) => {
            setText(data);
            ref.current && ref.current.focus();
          }}
        />
        <Box
          alignItems={"flex-end"}
          background={"black.800"}
          padding={"1rem 0.5rem"}
          position={"relative"}
        >
          <Textarea
            onKeyDown={handleEnter}
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Please enter your code"
            size="sm"
            resize={"vertical"}
            borderColor={"black.600"}
            _hover={{ borderColor: "black.600" }}
            _focus={{
              background: "transparent",
              outline: "none",
              borderColor: "purple.300",
              boxShadow: "none",
            }}
            rows={6}
            maxH={"20rem"}
            transition={"all 0.25s"}
            color={"text.100"}
            fontSize={"12px"}
            _placeholder={{ fontFamily: "Montserrat, sans-serif" }}
          />
          <Box
            zIndex={10}
            display={"flex"}
            padding={"1.2rem 11px"}
            right={"0"}
            left={"0"}
            justifyContent={"space-between"}
            width={"100%"}
            bottom={"0"}
            position={"absolute"}
            alignItems={"center"}
          >
            <Box
              display="flex"
              cursor={"pointer"}
              alignItems={"center"}
              gap={"2px"}
            >
              {lastQuestion && (
                <Tooltip label="Modify last Prompt">
                  <Box
                    onClick={() => {
                      setText(lastQuestion);
                      ref.current && ref.current.focus();
                    }}
                    transition={"all 0.25s"}
                    color={"gray.200"}
                    display={"flex"}
                    width={"1.5rem"}
                    height={"1.5rem"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    borderRadius={"0.325rem"}
                    _hover={{ background: "black.700" }}
                  >
                    <RiArrowGoBackLine />
                  </Box>
                </Tooltip>
              )}
              <Tooltip label="Insert from IDE">
                <Box
                  onClick={() => {
                    vsCode.postMessage({ command: "selectText" });
                    ref.current && ref.current.focus();
                  }}
                  transition={"all 0.25s"}
                  cursor={"pointer"}
                  color={"gray.200"}
                  display={"flex"}
                  width={"1.5rem"}
                  height={"1.5rem"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  borderRadius={"0.325rem"}
                  _hover={{ background: "black.700" }}
                >
                  <BiCodeAlt />
                </Box>
              </Tooltip>
            </Box>
            <Box display="flex" cursor={"pointer"} alignItems={"center"}>
              <Text
                fontSize={"0.7rem"}
                opacity={text ? "0.5" : "0"}
                marginRight={"0.5rem"}
                color={"text.100"}
              >
                <Text as={"b"}>Shift + Enter </Text>for new line
              </Text>
              <Box
                onClick={sendMessage}
                background={text && !isSending ? "purple.500" : "transparent"}
                transition={"all 0.25s"}
                color={"gray.200"}
                display={"flex"}
                width={"1.5rem"}
                height={"1.5rem"}
                alignItems={"center"}
                justifyContent={"center"}
                borderRadius={"0.325rem"}
                _hover={{
                  background: text && !isSending ? "purple.600" : "black.700",
                }}
              >
                <BsSendFill />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </MainContextWrapper>
  );
}

const Connector = ({
  icon,
  values,
  value,
  name,
  setConnector,
  connector,
  setConnectorType,
  connectorType,
}: any) => {

  return (
    <>
      {!connectorType && connectorType !== name ? (
        <Box
          onClick={() => setConnectorType(name)}
          flex={"1 1 33.33%"}
          transition={"all 0.25s"}
          alignItems={"center"}
          cursor={"pointer"}
          display={"flex"}
          gap={"0.25rem"}
          flexDirection={"column"}
          _hover={{ color: "text.200" }}
          color={"text.100"}
          margin={"auto"}
        >
          {icon}
          <Text>{name}</Text>
        </Box>
      ) : (
        connectorType === name && 
        <Box width={"100%"}>
          <Box
            onClick={() => setConnectorType("")}
            marginBottom={"1.25rem"}
            justifyContent={"center"}
            cursor={"pointer"}
            alignItems={"center"}
            color={"text.100"}
            display={"flex"}
            gap={"0.25rem"}
          >
            <IoArrowBackSharp fontSize={"1rem"} />
            <Text transition={"all 0.25s"} fontWeight={600}>
              {name}
            </Text>
          </Box>
          {values && !value && values.length > 0 ? (
            <Box
              overflow={connectorType != "API" ? "hidden" : ""}
              transition={"all 0.25s"}
              display={"flex"}
              flexWrap={"wrap"}
              gap={"1rem 0rem"}
            >
              {values.map(({ name, icon, value }: any) => (
                <Box
                  onClick={() => setConnector(value)}
                  flex={"1 1 33.33%"}
                  transition={"all 0.25s"}
                  alignItems={"center"}
                  cursor={"pointer"}
                  display={"flex"}
                  gap={"0.25rem"}
                  flexDirection={"column"}
                  _hover={{
                    color: value === connector ? "purple.500" : "text.200",
                  }}
                  color={value === connector ? "purple.400" : "text.100"}
                >
                  {icon}
                  <Text>{name}</Text>
                </Box>
              ))}
            </Box>
          ) : (
            !value &&
            <Text fontWeight={600} color={"text.100"} textAlign={"center"}>
              Coming Soon..
            </Text>
          )}
          {value && value}
        </Box>
      )}
    </>
  );
};
