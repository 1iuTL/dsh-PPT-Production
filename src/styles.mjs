export const STYLES = [
  {
    id: 'ink-paper', name: '墨纸', tags: ['academic', 'work'],
    palette: { bg: '#F7F6F3', ink: '#121214', accent: '#FF6900', muted: '#7A7A80', line: '#D6D4CE' },
    fonts: { heading: 'Microsoft YaHei', body: 'Microsoft YaHei' },
    density: 'balanced', motifs: ['roundRect', 'line'],
    rules: ['暖白纸底配近黑正文，橙色只作强调', '标题左对齐、留足上边距', '细线分隔，不用重阴影'],
  },
  {
    id: 'indigo-deep', name: '靛深', tags: ['tech', 'consulting'],
    palette: { bg: '#0E1230', ink: '#F2F4FF', accent: '#5B8CFF', muted: '#9AA3D0', line: '#2A3160' },
    fonts: { heading: 'Microsoft YaHei', body: 'Microsoft YaHei' },
    density: 'minimal', motifs: ['circle', 'line'],
    rules: ['深靛蓝底配浅字，亮蓝作焦点', '每页一个视觉重心', '圆点与细线构成秩序'],
  },
  {
    id: 'warm-sand', name: '暖砂', tags: ['promotion', 'work'],
    palette: { bg: '#FBF3E8', ink: '#3A2E22', accent: '#C8622A', muted: '#8A7A66', line: '#E4D6C2' },
    fonts: { heading: 'Microsoft YaHei', body: 'Microsoft YaHei' },
    density: 'balanced', motifs: ['roundRect'],
    rules: ['米砂底配陶土橙，温度感', '圆角卡片承载要点', '大标题、短句子'],
  },
  {
    id: 'night-navy', name: '夜航', tags: ['finance', 'consulting'],
    palette: { bg: '#0A0F1C', ink: '#E8ECF4', accent: '#37C8A0', muted: '#8B96AC', line: '#1E2740' },
    fonts: { heading: 'Microsoft YaHei', body: 'Microsoft YaHei' },
    density: 'dense', motifs: ['line', 'roundRect'],
    rules: ['近黑 navy 底配青绿强调', '网格化排布承载数据', '克制留白、信息优先'],
  },
  {
    id: 'bamboo-green', name: '青竹', tags: ['academic', 'promotion'],
    palette: { bg: '#F2F7F1', ink: '#1E2A1C', accent: '#3E8E5A', muted: '#6F8268', line: '#D3E2CE' },
    fonts: { heading: 'Microsoft YaHei', body: 'Microsoft YaHei' },
    density: 'minimal', motifs: ['circle', 'line'],
    rules: ['浅竹青底配墨绿正文', '圆形母题点缀', '疏朗排版、呼吸感'],
  },
]
export function getStyle(id) { return STYLES.find(s => s.id === id) }
export function listStyles() { return STYLES.map(({ id, name, tags, density, rules }) => ({ id, name, tags, density, rules })) }
