import * as React from "react";
import { Box, Button, ChakraProvider, useToast } from "@chakra-ui/react";
import { theme } from "./utils/theme";
import Main from "./container/Main";
import { io } from "socket.io-client";
import { getState, setState, vsCode } from "./utils/vsState";
import axios from "axios";
import { Login } from "./container/Login";
const socket = io("http://localhost:3000")

const delay = (sec: number) =>  new Promise(resolve => setTimeout(resolve, sec * 1000));

const App = () => {

  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const isLogged: any = React.useRef(null);
  const [pubColsData, setPubColsData] = React.useState<any>([]);
  const toast = useToast()

  React.useEffect(() => {
    socket.on("connect", () => {
      console.log("connected")
    })
    socket.on("auth", (data) => {
      if(data.error) {
        toast({
          title: `Something went wrong, please try again later`,
          status: "error",
          position: "top",
          isClosable: true,
        })
        setUser(null);
        isLogged.current = false;
        setIsLoading(false);
        return;
      }
      setUser(data.user);
      setState({key: "user", value: data.user});
      isLogged.current = true;
      setIsLoading(false);
    })
  }, [])

  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data
      switch (message.command) {
        case "pubColsData":
          const pubColsData = message.pubColsData;
          let arr: any = [];
          const existingOptions = new Set(pubColsData.map((option: any) => option.value)); 
          pubColsData.forEach((item: any) => {
            if (!existingOptions.has(item.documentGroupId)) {
                const data = { name: item.documentGroupId, value: item.documentGroupId };
                arr.push(data);
            }
          })
          setPubColsData(arr);
          break;
        case "auth": 
          if(message.error) {
            toast({
              title: `Something went wrong, please try again later`,
              status: "error",
              position: "top",
              isClosable: true,
            })
            setUser(null);
            isLogged.current = false;
            setIsLoading(false)
            return;
          };
          if (message.user) {
            setUser(message.user);
            isLogged.current = true;
          }
          setIsLoading(false)
      }
    });
    return (
      window.removeEventListener("message", () => {console.log("removed")})
    )
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    isLogged.current = false;
    vsCode.postMessage({command: "auth", socketId: socket.id});
    await delay(10);
    if(!isLogged.current) {
      toast({
        title: `Something went wrong, please try again later`,
        status: "error",
        position: "top",
        isClosable: true,
      })
      setIsLoading(false);
    }
  } 

  const handleLogout = async () => {
    isLogged.current = false;
    axios.get("http://localhost:3000/logout");
    setUser(null);
  } 

  return (
    <ChakraProvider theme={theme}>
      {
        user ? <Main user={user} pubColsData={pubColsData} handleLogout={() => handleLogout()} /> : <Login user={user} isLoading={isLoading} handleLogin={() => handleLogin()} />
      }
    </ChakraProvider>
  )
}

export default App;
