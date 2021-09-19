# t-SNEDatasetVisualizer
This project is a data visualization tool made to plot t-SNE computed datasets in a three dimensional space.
The project contains:
- an Angular app: which takes all the t-SNE processed data and shows in a 3D canvas the iterations of t-SNE.
- a Django app: processes t-SNE in datasets, saves all iterations and images on a PostgreSQL database and encodes the data when asked.

3D Canvas is implemented with Three.js Library. All data points are shown as spheres and will be colored if the data set is labeled. 
All spheres are rendered using the Instancing Method, with InstancedMesh class. 
Raycasting algorithm is implemented to show the original images and gives an additional insight on the processed data.
![t-SNEDataVisualizer Raycasting](./raycasting.gif)

