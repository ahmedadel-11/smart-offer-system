import React from 'react';
import { Tabs, Tab, Badge, Box } from '@mui/material';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  categoryCounts = {},
}) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onCategoryChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={selectedCategory || 'all'}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            minHeight: 48,
            fontWeight: 500,
          },
        }}
      >
        <Tab
          value="all"
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              All
              <Badge
                badgeContent={Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
                color="primary"
                max={999}
                sx={{ ml: 1 }}
              />
            </Box>
          }
        />
        {categories.map((category) => (
          <Tab
            key={category}
            value={category}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {category}
                {categoryCounts[category] !== undefined && (
                  <Badge
                    badgeContent={categoryCounts[category]}
                    color="default"
                    max={999}
                    sx={{
                      ml: 1,
                      '& .MuiBadge-badge': {
                        backgroundColor: 'grey.200',
                        color: 'text.secondary',
                      },
                    }}
                  />
                )}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default CategoryTabs;
