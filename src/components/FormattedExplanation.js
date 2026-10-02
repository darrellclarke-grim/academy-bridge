import { Text, View } from 'react-native';

export default function FormattedExplanation({ text }) {
  if (!text) return null;

  const regex = /(Why Option [A-D] fails:)/gi;
  const parts = text.split(regex);

  if (parts.length === 1) {
    return (
      <Text style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 20 }}>
        <Text style={{ fontWeight: 'bold', color: '#f97316' }}>Explanation: </Text>
        {text}
      </Text>
    );
  }

  const elements = [];
  let isFirstChunk = true;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (regex.test(part)) {
      elements.push(
        <Text
          key={i}
          style={{
            color: '#f97316',
            fontWeight: 'bold',
            fontSize: 13,
            marginTop: 12,
            marginBottom: 4,
            display: 'flex'
          }}
        >
          {part}
        </Text>
      );
    } else if (part.trim()) {
      if (isFirstChunk) {
        elements.push(
          <Text key={i} style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 20, marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold', color: '#f97316' }}>Explanation: </Text>
            {part.trim()}
          </Text>
        );
        isFirstChunk = false;
      } else {
        elements.push(
          <View key={i} style={{ paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#f97316', marginBottom: 8 }}>
            <Text style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 20 }}>
              {part.trim()}
            </Text>
          </View>
        );
      }
    }
  }

  return <View style={{ marginTop: 8 }}>{elements}</View>;
}