export default (clusterName: string): string => {
  const temp: string[] = clusterName.replace(" Cluster ", " --").split(" ");
  temp.pop();
  return temp.join(" ");
};
