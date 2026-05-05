import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

// Define as propriedades que o botão pode receber
interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode; 
}

export default function CustomButton({ 
  title, 
  variant = 'primary', 
  icon,
  style, 
  ...rest 
}: CustomButtonProps) {
  
  const getBackgroundColor = () => {
    if (variant === 'secondary') return theme.colors.secondary;
    if (variant === 'danger') return theme.colors.danger;
    return theme.colors.primary;
  };

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: getBackgroundColor() }, style]} 
      {...rest}
    >
      {icon && icon}
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: theme.colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  }
});