import { useColorMode } from 'theme-ui';
import colors from '../gatsby-plugin-theme-ui/colors';

const customColors = Object.keys(colors.modes);
const modes = ['light', ...customColors];

function useCycleColor() {
  const [colorMode, setColorMode] = useColorMode();

  const cycleColorMode = () => {
      var i = modes.indexOf(colorMode);
      console.log(i);
      if(i === -1) i = 1;
      if(i === 4) i = 1;
      else i += 1;
      const n = (i) % modes.length;
      setColorMode(modes[n]);
  };
  return { cycleColorMode };
}

export default useCycleColor;
