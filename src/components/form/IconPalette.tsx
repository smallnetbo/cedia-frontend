import React,{ useState } from 'react';
import { Grid, IconButton, Dialog, DialogTitle, DialogContent,Typography,TextField  } from '@mui/material';
import * as Icons from '@mui/icons-material';
import Icon from '@mui/material/Icon';

type IconPaletteProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  iconOptions: { key: string; label: string; value: string }[];
};

const IconPalette: React.FC<IconPaletteProps> = ({ open, onClose, onSelect, iconOptions }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const filteredIcons = iconOptions.filter(iconOption =>
    iconOption.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select an Icon<Icon>{'palette'}</Icon></DialogTitle>
      <DialogContent>

      <TextField
          fullWidth
          placeholder="Search icons..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          margin="normal"
        />
        <Grid container spacing={2}>
          {filteredIcons.map(iconOption => {
            const IconComponent = Icons[iconOption.label as keyof typeof Icons];
            return (
              <Grid item xs={2} key={iconOption.key} textAlign="center">
                <IconButton 
                  onClick={() => onSelect(iconOption.label)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  {IconComponent ? <IconComponent /> : <Icon>{iconOption.label}</Icon>}
                  <Typography variant="caption" style={{ marginTop: 8 }}>{iconOption.label}</Typography>
                </IconButton>
                
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default IconPalette;
