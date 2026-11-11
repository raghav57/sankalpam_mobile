import { StyleSheet } from 'react-native';
import { SankalpamColors as colors } from '@/constants/sankalpam';

export const authStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 24, gap: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.saffron },
  text: { fontSize: 16, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, borderRadius: 12, padding: 14, fontSize: 16, color: colors.text },
  button: { backgroundColor: colors.saffron, borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },
  link: { color: colors.saffron, fontSize: 16, paddingVertical: 8 },
  error: { color: '#A32424', fontSize: 16 },
  loading: { marginTop: 40 },
});
