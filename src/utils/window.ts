
export const declareGlobal = (name: string, value: any) => {
  if(!(window as any)._temp) (window as any)._temp = {};
  (window as any)._temp[name] = value;
};
