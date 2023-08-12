import React from "react"
import { Box, useRadio } from "@chakra-ui/react"

export const RadioCard = (props: any) => {
    const { getInputProps, getRadioProps } = useRadio(props)
  
    const input = getInputProps()
    const checkbox = getRadioProps()
  
    return (
      <Box flex={"1 1 33.33%"} as='label'>
        <input {...input} />
        <Box
          {...checkbox}
          cursor='pointer'
          borderRadius='md'
          color={"text.100"}
          transition={"all 0.25s"}
          fontWeight={600}
          textAlign={"center"}
          _checked={{
            bg: 'purple.500',
            color: 'text.200',
          }}
          _hover={{
            bg: 'purple.600',
            color: 'text.200',
          }}
          px={4}
          py={3}
        >
          {props.children}
        </Box>
      </Box>
    )
  }