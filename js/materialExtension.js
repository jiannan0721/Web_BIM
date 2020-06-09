class materialExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.tree = null;

        this.colorPresets = [
            '#73CEFF',
            '#92CF00',
            '#FFF365',
            '#FFA923',
            '#FF1600'
        ];

        this.customize = this.customize.bind(this);
        this.createMaterial = this.createMaterial.bind(this);
    }

    load() {
        console.log('materialExtension is loaded!');

        this.tree = this.viewer.model.getData().instanceTree;
        this.customize();

        return true;
    }
    unload() {
        console.log('materialExtension is now unloaded!');

        return true;
    }

    customize() {

        //Start custom code here ...
        let viewer = this.viewer;
        const roomID = 412;

        let myMaterial = this.createMaterial(this.colorPresets[0]);

        // used to rescale and remove the z-fighting
        let scaleRatio = 0.995; // this was determined as optimal through visual inspection


        this.tree.enumNodeFragments(roomID, (fragId) => {
            viewer.model.getFragmentList().setMaterial(fragId, myMaterial);

            /* important technique if you want to remove z-fighting */
            let fragProxy = viewer.impl.getFragmentProxy(viewer.model, fragId);
            // fragProxy.scale = new THREE.Vector3(scaleRatio,scaleRatio,scaleRatio);
            fragProxy.updateAnimTransform();
        });

        viewer.impl.invalidate(true);

    }


    createMaterial(color) {

        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            reflectivity: 0.0,
            flatShading: true,
            transparent: true,
            opacity: 0.5,
            color
        });

        const materials = this.viewer.impl.matman();

        materials.addMaterial(
            "MyCustomMaterial" + color.toString(),
            material,
            true);

        return material;
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('materialExtension', materialExtension);
