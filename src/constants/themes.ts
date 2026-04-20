export interface Theme {
  id: string;
  name: string;
  bg: string;
  bgSecondary: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryGlow: string;
  secondary: string;
  text: string;
  textMuted: string;
  border: string;
  gradients: string[];
}

export const THEMES: Theme[] = [
  { id:'void', name:'VOID', bg:'#000000', bgSecondary:'#050505', surface:'#0A0A0A', surfaceAlt:'#111111', primary:'#00FFFF', primaryGlow:'#00FFFF30', secondary:'#FF00FF', text:'#FFFFFF', textMuted:'#555555', border:'#1A1A1A', gradients:['#000000','#001A1A'] },
  { id:'abyss', name:'ABYSS', bg:'#00000F', bgSecondary:'#05050F', surface:'#0A0A1A', surfaceAlt:'#0F0F22', primary:'#4488FF', primaryGlow:'#4488FF30', secondary:'#00AAFF', text:'#E0E8FF', textMuted:'#334477', border:'#1A1A3A', gradients:['#00000F','#001030'] },
  { id:'phantom', name:'PHANTOM', bg:'#05000D', bgSecondary:'#0A0015', surface:'#100020', surfaceAlt:'#150028', primary:'#AA44FF', primaryGlow:'#AA44FF30', secondary:'#FF44AA', text:'#EEE0FF', textMuted:'#442266', border:'#220044', gradients:['#05000D','#1A0035'] },
  { id:'eclipse', name:'ECLIPSE', bg:'#080008', bgSecondary:'#0D000D', surface:'#150015', surfaceAlt:'#1A001A', primary:'#FF44FF', primaryGlow:'#FF44FF30', secondary:'#AA00AA', text:'#FFE0FF', textMuted:'#551155', border:'#2A002A', gradients:['#080008','#200020'] },
  { id:'shadow', name:'SHADOW', bg:'#080808', bgSecondary:'#0F0F0F', surface:'#161616', surfaceAlt:'#1E1E1E', primary:'#BBBBBB', primaryGlow:'#BBBBBB30', secondary:'#888888', text:'#EEEEEE', textMuted:'#444444', border:'#222222', gradients:['#080808','#1A1A1A'] },
  { id:'crimson', name:'CRIMSON', bg:'#0F0000', bgSecondary:'#150000', surface:'#1A0000', surfaceAlt:'#220000', primary:'#FF2244', primaryGlow:'#FF224430', secondary:'#FF6600', text:'#FFE0E0', textMuted:'#551122', border:'#330000', gradients:['#0F0000','#2A0010'] },
  { id:'forest', name:'FOREST', bg:'#000F00', bgSecondary:'#001500', surface:'#001A00', surfaceAlt:'#002200', primary:'#00FF88', primaryGlow:'#00FF8830', secondary:'#44FF44', text:'#E0FFE8', textMuted:'#115522', border:'#003300', gradients:['#000F00','#001A0A'] },
  { id:'depths', name:'DEPTHS', bg:'#000F0F', bgSecondary:'#001515', surface:'#001A1A', surfaceAlt:'#002222', primary:'#00FFDD', primaryGlow:'#00FFDD30', secondary:'#00AAAA', text:'#E0FFFF', textMuted:'#115544', border:'#003333', gradients:['#000F0F','#001A1A'] },
  { id:'nebula', name:'NEBULA', bg:'#04000E', bgSecondary:'#080018', surface:'#0C0022', surfaceAlt:'#10002C', primary:'#8833FF', primaryGlow:'#8833FF30', secondary:'#3388FF', text:'#E8E0FF', textMuted:'#331166', border:'#1A0044', gradients:['#04000E','#10003A'] },
  { id:'inferno', name:'INFERNO', bg:'#0F0500', bgSecondary:'#150800', surface:'#1A0A00', surfaceAlt:'#221200', primary:'#FF6600', primaryGlow:'#FF660030', secondary:'#FFAA00', text:'#FFE8D0', textMuted:'#552200', border:'#331500', gradients:['#0F0500','#2A1000'] },
  { id:'frost', name:'FROST', bg:'#000510', bgSecondary:'#000A18', surface:'#000F22', surfaceAlt:'#00152C', primary:'#88DDFF', primaryGlow:'#88DDFF30', secondary:'#AABBFF', text:'#E8F4FF', textMuted:'#224466', border:'#002244', gradients:['#000510','#001A30'] },
  { id:'toxic', name:'TOXIC', bg:'#010F00', bgSecondary:'#021500', surface:'#031A00', surfaceAlt:'#052200', primary:'#AAFF00', primaryGlow:'#AAFF0030', secondary:'#00FF44', text:'#F0FFE0', textMuted:'#336600', border:'#1A3300', gradients:['#010F00','#0A1A00'] },
  { id:'rose', name:'ROSE', bg:'#0F0008', bgSecondary:'#150010', surface:'#1A0015', surfaceAlt:'#22001C', primary:'#FF44AA', primaryGlow:'#FF44AA30', secondary:'#FF0066', text:'#FFE0F0', textMuted:'#551133', border:'#330022', gradients:['#0F0008','#2A0020'] },
  { id:'aureate', name:'AUREATE', bg:'#0A0800', bgSecondary:'#100D00', surface:'#161200', surfaceAlt:'#1E1800', primary:'#FFCC00', primaryGlow:'#FFCC0030', secondary:'#FF8800', text:'#FFF5D0', textMuted:'#553300', border:'#2A2000', gradients:['#0A0800','#1A1200'] },
  { id:'midnight', name:'MIDNIGHT', bg:'#00000F', bgSecondary:'#000018', surface:'#000022', surfaceAlt:'#00002C', primary:'#3344FF', primaryGlow:'#3344FF30', secondary:'#0022AA', text:'#D0D8FF', textMuted:'#223388', border:'#00003A', gradients:['#00000F','#00001A'] },
  { id:'obsidian', name:'OBSIDIAN', bg:'#030303', bgSecondary:'#060606', surface:'#0A0A0A', surfaceAlt:'#0F0F0F', primary:'#C0C0C0', primaryGlow:'#C0C0C030', secondary:'#808080', text:'#F0F0F0', textMuted:'#404040', border:'#1A1A1A', gradients:['#030303','#111111'] },
  { id:'blood', name:'BLOOD', bg:'#0F0000', bgSecondary:'#180000', surface:'#200000', surfaceAlt:'#280000', primary:'#FF0022', primaryGlow:'#FF002230', secondary:'#880000', text:'#FFD0D0', textMuted:'#660000', border:'#330000', gradients:['#0F0000','#220000'] },
  { id:'emerald', name:'EMERALD', bg:'#000F05', bgSecondary:'#001508', surface:'#001A0A', surfaceAlt:'#00220E', primary:'#00FF88', primaryGlow:'#00FF8830', secondary:'#00CCAA', text:'#D0FFF0', textMuted:'#116644', border:'#003318', gradients:['#000F05','#001A10'] },
  { id:'cosmic', name:'COSMIC', bg:'#03000A', bgSecondary:'#060014', surface:'#0A001E', surfaceAlt:'#0F0028', primary:'#CC00FF', primaryGlow:'#CC00FF30', secondary:'#6600FF', text:'#F0D0FF', textMuted:'#440066', border:'#1A0033', gradients:['#03000A','#150022'] },
];

export const ANIMATION_NAMES = [
  'Particles','Pulse','Waves','Stars','Aurora',
  'Matrix','Nebula','Embers','Ripple','Grid',
  'Spiral','Bubbles','Geometric','Glitch','Rain',
  'Vortex','Static','Bars','Minimal',
];
