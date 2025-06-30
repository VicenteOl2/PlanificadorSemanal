// src/pages/Auth.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import {  
  Flex,
  Box,
  Input,
  Button,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  Icon,
} from "@chakra-ui/react";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Auth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home", { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box mt={20} textAlign="center">
        <Spinner size="xl" color="teal.400" />
        <Text mt={4}>Procesando inicio de sesión...</Text>
      </Box>
    );
  }

  return (
   <Flex
  w="100vw"
  h="100vh"
  align="center"
  justify="center"
  bgGradient="linear(to-br, teal.400, pink.300, yellow.200)"
  bgSize="200% 200%"
  animation="gradient 8s ease infinite"
  sx={{
    '@keyframes gradient': {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
  }}
>
  <Box
  position="fixed"
  bottom="4"
  right="6"
  zIndex={10}
  color="#fff"
  fontSize="sm"
  opacity={0.7}
  fontWeight="bold"
  letterSpacing="wider"
  userSelect="none"
>
  © {new Date().getFullYear()} V WebCrafter
</Box>
  <Box position="absolute" top={12} left={0} right={0}>
    <Heading
   as="h1"
  size="2xl"
  textAlign="center"
  fontWeight="extrabold"
  letterSpacing="wider"
  userSelect="none"
  sx={{
    background: "linear-gradient(90deg, #fff700, #00e0ff, #ff00c8, #fff700)",
    backgroundSize: "200% 200%",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    animation: "gradient-move 4s ease-in-out infinite",
    textShadow: "2px 2px 8px rgba(0,0,0,0.18)", // sombra para contraste
    "@keyframes gradient-move": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
  }}
    >
      WeeklyPlanner
    </Heading>
     </Box>
      <MotionBox
         initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  bg="#ffe5ec" // Cambia aquí el color de fondo
  color="#22223b"
  p={8}
  borderRadius="md"
  boxShadow="0 10px 40px rgba(0,0,0,0.08)"
  w="100%"
  maxW="400px"
  position="relative"
  border="1px solid #e0e0e0"
      >
        <Heading mb={4} size="lg" textAlign="center" color="teal.500">
          Iniciar sesión
        </Heading>

        {error && (
          <Alert status="error" fontSize="sm" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
     <Input
  type="email"
  placeholder="Correo electrónico"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  bg="#fff" // blanco para mayor contraste
  color="#1a202c" // texto oscuro
  border="2px solid #43a047" // borde verde
  _placeholder={{ color: "#6b7280" }} // placeholder gris oscuro
  _focus={{ borderColor: "#1976d2", boxShadow: "0 0 0 2px #1976d255" }}
  isRequired
/>
<Input
  placeholder="Contraseña"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  bg="#fff"
  color="#1a202c"
  border="2px solid #43a047"
  _placeholder={{ color: "#6b7280" }}
  _focus={{ borderColor: "#1976d2", boxShadow: "0 0 0 2px #1976d255" }}
  isRequired
/>
            <Button
              colorScheme="teal"
              leftIcon={<Icon as={FaSignInAlt as React.ElementType} />}
              type="submit"
              width="100%"
              fontWeight="bold"
              size="md"
            >
              Entrar
            </Button>
            <Button
              colorScheme="teal"
              variant="solid"
              width="100%"
              mt={1}
              fontWeight="bold"
              size="md"
              rightIcon={<Icon as={FaUserPlus as React.ElementType} />}
              onClick={() => navigate("/registro")}
              _active={{
                transform: "scale(0.95)",
                boxShadow: "md",
              }}
              transition="all 0.1s"
            >
              ¿No tienes cuenta? Regístrate
            </Button>
          </VStack>
        </form>
      </MotionBox>
    </Flex>
    
   
  );
};

export default Auth;