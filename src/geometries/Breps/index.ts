import * as THREE from 'three';
import * as WEBIFC from 'web-ifc';

export class Breps {
    constructor(
        public ifcAPI: WEBIFC.IfcAPI,
        public modelId: number
    ) {}
    
    private triangleToIFCFace(triangle: THREE.Vector3[]): WEBIFC.IFC4X3.IfcFace {
       
        const points = triangle.map(vertex => {
            const x = vertex.x;
            const y = vertex.y;
            const z = vertex.z;
    
            const lengthMeasureX = new WEBIFC.IFC4X3.IfcLengthMeasure(x);
            const lengthMeasureY = new WEBIFC.IFC4X3.IfcLengthMeasure(y);
            const lengthMeasureZ = new WEBIFC.IFC4X3.IfcLengthMeasure(z);

            return new WEBIFC.IFC4X3.IfcCartesianPoint([lengthMeasureX, lengthMeasureY, lengthMeasureZ]);
        });

        const polyLoop = new WEBIFC.IFC4X3.IfcPolyLoop(points);
        const ifcBool = new WEBIFC.IFC4X3.IfcBoolean(true);
        const faceBound = new WEBIFC.IFC4X3.IfcFaceBound(polyLoop, ifcBool);
        const ifcFace = new WEBIFC.IFC4X3.IfcFace([faceBound]); 
        return ifcFace;
    }

    public convertGeometryToBrep(geometry: THREE.BufferGeometry): WEBIFC.IFC4X3.IfcFacetedBrep {
        
        const position = geometry.getAttribute('position');
        const index = geometry.getIndex();
        const ifcClosedShell = new WEBIFC.IFC4X3.IfcClosedShell([]);
        
        if (position && index) {
            const positions = position.array as Float32Array;
            const indices = index.array as Uint16Array;

            for (let i = 0; i < indices.length; i += 3) {
                const vertex1 = new THREE.Vector3().fromArray(positions, indices[i] * 3);
                const vertex2 = new THREE.Vector3().fromArray(positions, indices[i + 1] * 3);
                const vertex3 = new THREE.Vector3().fromArray(positions, indices[i + 2] * 3);

                const triangle = [vertex1, vertex2, vertex3];
                const ifcFace = this.triangleToIFCFace(triangle);

                ifcClosedShell.CfsFaces.push(ifcFace);
            }
        }
        const brep = new WEBIFC.IFC4X3.IfcFacetedBrep(ifcClosedShell);
        return brep;
    }
}