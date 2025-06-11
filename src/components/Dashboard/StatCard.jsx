import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography
} from '@mui/material';

const StatCard = ({ title, value, icon, bgColor, iconColor }) => {
  return (
    <Card sx={{ backgroundColor: bgColor, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {React.cloneElement(icon, { sx: { ...icon.props.sx, color: iconColor } })}
          <Typography variant="h6" sx={{ ml: 2 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard; 