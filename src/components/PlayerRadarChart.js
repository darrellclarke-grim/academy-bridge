import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

export default function PlayerRadarChart({ player, size = 260 }) {
  if (!player) return null;

  // Calculate 0-10 pillar averages
  const calcAvg = (keys) => {
    const validKeys = keys.filter(k => typeof player[k] === 'number');
    if (validKeys.length === 0) return 5;
    const sum = validKeys.reduce((acc, k) => acc + player[k], 0);
    return Math.round((sum / validKeys.length) * 10) / 10;
  };

  const physicalAvg = calcAvg(['phys_sprint', 'phys_accel', 'phys_stamina', 'phys_strength', 'phys_agility']);
  const technicalAvg = calcAvg(['tech_first_touch', 'tech_dribbling', 'tech_short_pass', 'tech_long_pass', 'tech_shooting_acc', 'tech_tackling', 'gk_shot_stopping', 'gk_handling']);
  const tacticalAvg = calcAvg(['tact_awareness', 'tact_pressing', 'tact_instructions', 'tact_decision']);
  const psychologicalAvg = calcAvg(['psych_confidence', 'psych_leadership', 'psych_workrate', 'psych_composure']);

  const values = [physicalAvg, technicalAvg, tacticalAvg, psychologicalAvg];
  const labels = ['PHY', 'TEC', 'TAC', 'PSY'];

  const center = size / 2;
  const radius = (size / 2) - 40; // Leave margin for labels
  const numAxes = 4;

  // Map 0-10 score to SVG (x, y) coordinates
  const getCoordinates = (value, index) => {
    const angle = (Math.PI / 2) + (index * (2 * Math.PI / numAxes));
    const normalizedVal = (value / 10) * radius;
    const x = center + normalizedVal * Math.cos(angle);
    const y = center - normalizedVal * Math.sin(angle);
    return { x, y };
  };

  // Build grid rings (25%, 50%, 75%, 100%)
  const gridLevels = [2.5, 5.0, 7.5, 10.0];

  // Data points polygon string
  const points = values
    .map((val, idx) => {
      const { x, y } = getCoordinates(val, idx);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={styles.container}>
      <Svg height={size} width={size}>
        {/* Background Grid Rings */}
        {gridLevels.map((level, idx) => {
          const ringPoints = Array.from({ length: numAxes })
            .map((_, i) => {
              const { x, y } = getCoordinates(level, i);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <Polygon
              key={idx}
              points={ringPoints}
              stroke="#233554"
              strokeWidth="1"
              fill={idx % 2 === 0 ? 'rgba(30, 41, 59, 0.4)' : 'transparent'}
            />
          );
        })}

        {/* Axes Lines */}
        {Array.from({ length: numAxes }).map((_, i) => {
          const { x, y } = getCoordinates(10, i);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Player Stats Polygon Area */}
        <Polygon
          points={points}
          fill="rgba(249, 115, 22, 0.45)"
          stroke="#f97316"
          strokeWidth="2.5"
        />

        {/* Data Point Dots */}
        {values.map((val, idx) => {
          const { x, y } = getCoordinates(val, idx);
          return (
            <Circle
              key={idx}
              cx={x}
              cy={y}
              r="4"
              fill="#ffffff"
              stroke="#f97316"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels & Values */}
        {labels.map((label, idx) => {
          const { x, y } = getCoordinates(11.8, idx);
          return (
            <SvgText
              key={idx}
              x={x}
              y={y + 4}
              fill="#f97316"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              {`${label} (${values[idx]})`}
            </SvgText>
          );
        })}
      </Svg>

      <View style={styles.legendRow}>
        <Text style={styles.legendText}>🏋️ PHY: <Text style={styles.valText}>{physicalAvg}</Text></Text>
        <Text style={styles.legendText}>⚽ TEC: <Text style={styles.valText}>{technicalAvg}</Text></Text>
        <Text style={styles.legendText}>🧠 TAC: <Text style={styles.valText}>{tacticalAvg}</Text></Text>
        <Text style={styles.legendText}>🔥 PSY: <Text style={styles.valText}>{psychologicalAvg}</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10, paddingHorizontal: 10 },
  legendText: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' },
  valText: { color: '#ffffff', fontWeight: 'bold' }
});