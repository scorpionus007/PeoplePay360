import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  prefix,
  suffix,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, !!error && styles.inputError]}>
        {prefix && <View style={styles.prefixWrapper}>{prefix}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.ink400}
          selectionColor={colors.primary600}
          {...rest}
        />
        {suffix && <View style={styles.suffixWrapper}>{suffix}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink800,
    marginBottom: 6,
    fontFamily: 'System',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#D8DBEA',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputError: {
    borderColor: colors.rose500,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink950,
    fontFamily: 'System',
    paddingVertical: 0,
  },
  prefixWrapper: {
    marginRight: 8,
  },
  suffixWrapper: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.rose500,
    marginTop: 4,
    fontFamily: 'System',
  },
});
