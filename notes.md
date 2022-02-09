## Design Issues
- [x][Fabric] El placeholder del input del nombre del nuevo objecto es poco intuitivo.
- [x][UI] Las cargas asincrónicas de un componente no queda claro cuando está cargando y el usuario tendra que esperar.
- [x][SelectableList] Es confuso cuando hay una lista de selecion multiple con el uso de un `ActionBar`
- [~][Fabric] Los componentes de los fields que usan inputs de texto tienen un tamaño pequeño y pueden dificultar la lectura y escritura. 
- [~][Fabric] Los componentes de por defecto para cada tipo pueden ser inecesarios para ese tipo
- [~][Workload.creator] Selector de variantes y cantidad puede ser engorroso cuando hay un pedido de mucha cantidad.(Muchos clicks para modificar la cantidad) 

- [Fabric] Poco intuitivo para cambiar de tipo de objecto.

## Bugs
- [x][Workload.creator] Algunos componentes tiene fallos de traduccion, la traduccion no esta completa o no existe una traduccion.

## To work on
- [Server] Emitir un evento cuando el operador empieza a trabajar en un pedido.
- [Workload.inspector] Visualizar la lista de operadores y una monitorizacion en tiempo real de las actualizaciones de los operadores. 
- [x][UI] Feedback cuando la estabilidad de la red es mala.
- [UI] Native notifications
- [UI] Sound alerts on workorders events
- [Fabric] Implement `ImagePreview`