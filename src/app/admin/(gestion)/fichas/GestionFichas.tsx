import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import FormFichasView from './FormFichaView'
import SubSectorView from './SubSectoresView'
import VariablesView from './VariablesView'
import ItemsView from './ItemsView'

export default function GestionFichasPage() {
  const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Ficha" value="1" />
            <Tab label="Sub Sectores" value="2" />
            <Tab label="Variables" value="3" />
            <Tab label="Items" value="4" />
          </TabList>
        </Box>
        <TabPanel value="1"><FormFichasView/> </TabPanel>
        <TabPanel value="2"><SubSectorView/></TabPanel>
        <TabPanel value="3"><VariablesView/></TabPanel>
        <TabPanel value="4"><ItemsView/></TabPanel>
      </TabContext>
    </Box>
  );
}
