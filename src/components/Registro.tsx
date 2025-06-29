import react from 'react';
import React, { useState } from 'react';
import { transition,Flex,Box,
  BoxProps,
  Input,
  Button,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { FaUserPlus,FaArrowRight } from 'react-icons/fa';
import { IconType } from "react-icons";
import { motion } from "framer-motion";
import { ComponentProps } from "react";
import { useNavigate } from "react-router-dom";



const FaUserPlusIcon: IconType = FaUserPlus;
const MotionBox = motion<Omit<BoxProps, "transition">>(Box);



const Registro: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleRegistro = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg('');
  setSuccessMsg('');

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    setSuccessMsg('✅ Cuenta creada con éxito. Redirigiendo...');
    setEmail('');
    setPassword('');
    setTimeout(() => {
      navigate("/");
    }, 1200);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      setErrorMsg('⚠️ Ya estás registrado. Inicia sesión desde el menú principal.');
    } else if (error.code === 'auth/weak-password') {
      setErrorMsg('⚠️ La contraseña debe tener al menos 6 caracteres.');
    } else {
      setErrorMsg('❌ Ocurrió un error inesperado al registrarse.');
    }
  } finally {
    setLoading(false);
  }
};
  if (loading) {
    return (
      <Box mt={20} textAlign="center">
        <Spinner size="xl" color="teal.400" />
        <Text mt={4}>Procesando registro...</Text>
      </Box>
    );
  }

  return (
<Flex
  w="100vw"
  h="100vh"
  align="center"
  justify="center"
  // Fondo animado con gradiente
  bgGradient="linear(to-br, teal.400, pink.300, yellow.200)"
  bgSize="200% 200%"
  animation="gradient 8s ease infinite"
  sx={{
    '@keyframes gradient': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    }
  }}
>
  <MotionBox
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  bg="red.700"
  color="white"
  p={8}
  borderRadius="md"
  boxShadow="0 10px 40px rgba(0,0,0,0.2)"
  w="100%"
  maxW="400px"
  position="relative"
  border="1px solid rgba(255,255,255,0.2)"
>

      <Heading mb={4} size="lg" textAlign="center" color="teal.500">
        Crear cuenta
      </Heading>

      {errorMsg && (
        <Alert status="error" fontSize="sm" mb={4}>
          <AlertIcon />
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert status="success" fontSize="sm" mb={4}>
          <AlertIcon />
          {successMsg}
        </Alert>
      )}

      <form onSubmit={handleRegistro}>
        <VStack spacing={4}>
          
          <Input
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="filled"
            focusBorderColor="teal.400"
            isRequired
          />
          <Input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="filled"
            focusBorderColor="teal.400"
            isRequired
          />
        <Button
         colorScheme="teal"
        leftIcon={<Icon as={FaUserPlus as React.ElementType} />}
        type="submit"
        >
        Registrarse
        </Button>

   
  <Button
   colorScheme="teal"
  variant="solid"
  width="100%"
  mt={1}
  fontWeight="bold"
  size="md"
  rightIcon={<Icon as={FaArrowRight as React.ElementType} />}
  onClick={() => navigate("/login")}
  _active={{
    transform: "scale(0.95)",
    boxShadow: "md",
  }}
  transition="all 0.1s"
>
  ¿Ya tienes cuenta?
</Button>


        </VStack>
      </form>
    </MotionBox>
     </Flex>
  );
};

export default Registro;