import { Box, Button, Spinner } from "@chakra-ui/react"
import logo from "../assets/entail.svg"
import { useState } from "react";
import { vsCode } from "../utils/vsState";

export const Login = ({handleLogin, isLoading}: any) => {

    return (
        <Box display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} gap={"1rem"} height={"89vh"}>
            {
                !isLoading ? 
                <>
                    <Box display={"flex"} fontSize={"16px"} color={"text.200"} fontWeight={"600"} alignItems={"center"} gap={"0.5rem"}> <img src={logo} /> EntailMate AI </Box>
                    <Box onClick={handleLogin} cursor={"pointer"} borderRadius={"8px"} padding={"10px 14px"} fontWeight={"600"} background={"purple.500"} color={"text.200"}>Login</Box>
                </>
                : <Spinner 
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='purple.500'
                    size='xl' 
                  />
            }
        </Box>
    )
}