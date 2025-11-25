export interface FilterConfig {
  id: string;
  name: string;
  icon: string;
  type?: 'category' | 'action';
  subFilters?: FilterConfig[];
}

export const filterTree: Record<string, FilterConfig[]> = {
  root: [
    {
      id: 'male',
      name: 'Masculino',
      icon: 'man-outline',
      type: 'category',
      subFilters: []
    },
    {
      id: 'female',
      name: 'Feminino',
      icon: 'woman-outline',
      type: 'category',
      subFilters: []
    },
    {
      id: 'graduation',
      name: 'Formatura',
      icon: 'school-outline',
      type: 'category',
      subFilters: []
    },
    {
      id: 'wedding',
      name: 'Casamento',
      icon: 'heart-outline',
      type: 'category',
      subFilters: []
    },
    {
      id: 'wallet',
      name: 'Carteira',
      icon: 'wallet',
      type: 'action'
    },
    {
      id: 'profile',
      name: 'Perfil',
      icon: 'person',
      type: 'action'
    }
  ],
  male: [
    { id: 'rings', name: 'Anéis', icon: 'ellipse', type: 'category' },
    { id: 'necklaces', name: 'Colares', icon: 'link', type: 'category' },
    { id: 'bracelets', name: 'Pulseiras', icon: 'watch-outline', type: 'category' },
    { id: 'earrings', name: 'Brincos', icon: 'ear', type: 'category' }
  ],
  female: [
    { id: 'rings', name: 'Anéis', icon: 'ellipse', type: 'category' },
    { id: 'necklaces', name: 'Colares', icon: 'link', type: 'category' },
    { id: 'bracelets', name: 'Pulseiras', icon: 'watch-outline', type: 'category' },
    { id: 'earrings', name: 'Brincos', icon: 'ear', type: 'category' }
  ],
  graduation: [
    { id: 'rings', name: 'Anéis', icon: 'ellipse', type: 'category' },
    { id: 'medals', name: 'Medalhas', icon: 'medal', type: 'category' },
    { id: 'pins', name: 'Broches', icon: 'star', type: 'category' },
    { id: 'cufflinks', name: 'Abotoaduras', icon: 'square', type: 'category' }
  ],
  wedding: [
    { id: 'rings', name: 'Alianças', icon: 'ellipse', type: 'category' },
    { id: 'sets', name: 'Conjuntos', icon: 'albums', type: 'category' },
    { id: 'tiaras', name: 'Tiaras', icon: 'sunny', type: 'category' },
    { id: 'bracelets', name: 'Pulseiras', icon: 'watch-outline', type: 'category' }
  ]
};

export const getFiltersForCategory = (categoryId: string): FilterConfig[] => {
  return filterTree[categoryId] || filterTree.root;
};
