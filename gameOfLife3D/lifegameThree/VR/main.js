window.addEventListener('load', init);
function init() {

    const CELL_SIZE = 25;
    const GENERATE_PROBABILITY = 0.25;
    const AGE_LIMIT = 15;
    let age = 0;

    let currentState = Array.from(new Array(CELL_SIZE), () => {
        return Array.from(new Array(CELL_SIZE), () => new Array(CELL_SIZE).fill(0))
    });
    let bufferState = Array.from(JSON.parse(JSON.stringify(currentState)));

    // ------
    // Init Three
    // ------

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector('#myCanvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.vr.enabled = true;
    const scene = new THREE.Scene();

    // camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 100;
    controls.maxDistance = 1000;
    camera.position.set(0, 0, 500);

    // light
    scene.add(new THREE.AmbientLight(0x404040));
    const pointLight = new THREE.PointLight(0xFFFFFF, 5);
    camera.add(pointLight);
    scene.add(pointLight);
    const light = new THREE.DirectionalLight(0xFFFFFF, 2);
    scene.add(light);

    let geometry = new THREE.Geometry();
    const cellGeometry = new THREE.BoxGeometry(8, 8, 8);
    const matrix = new THREE.Matrix4();
    //const material = new THREE.MeshNormalMaterial();
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);


    // main loop 
    tick();
    function tick() {
        // mesh.rotation.x += Math.PI / 1800;
        // mesh.rotation.y += Math.PI / 1800;
        renderer.render(scene, camera);
        renderer.setAnimationLoop(tick);
    }

    // live flag
    const judge = (x, y, z) => {
        let judgeValue = 0;
        const START = -1;
        const END = 2;
        for (let i = START; i < END; i++) {
            if ((x + i) < 0 || (x + i) >= CELL_SIZE) {
                continue;
            }

            for (let j = START; j < END; j++) {
                if ((y + j) < 0 || (y + j) >= CELL_SIZE) {
                    continue;
                }

                for (let k = START; k < END; k++) {
                    if ((z + k) < 0 || (z + k) >= CELL_SIZE) {
                        continue;
                    }
                    else if (i == 0 && j == 0 && k == 0) {
                    }
                    else {
                        judgeValue += currentState[x + i][y + j][z + k];
                    }

                }
            }
        }

        if (currentState[x][y][z] > 0 && (judgeValue == 5 || judgeValue == 7)) {
            return true;
        }
        if (currentState[x][y][z] == 0 && judgeValue == 6) {
            return true;
        }
        return false;
    }

    const randomSet = () => {
        geometry = new THREE.Geometry();
        for (let i = 0; i < CELL_SIZE; i++) {
            for (let j = 0; j < CELL_SIZE; j++) {
                for (let k = 0; k < CELL_SIZE; k++) {
                    if (Math.random() <= GENERATE_PROBABILITY) {
                        matrix.makeTranslation(
                            10 * (i - CELL_SIZE / 2),
                            10 * (j - CELL_SIZE / 2),
                            10 * (k - CELL_SIZE / 2)
                        );
                        geometry.merge(cellGeometry, matrix);
                        currentState[i][j][k] = 1;
                    }
                    else {
                        currentState[i][j][k] = 0;
                    }
                }
            }
        }
        mesh.geometry.dispose();
        mesh.geometry = geometry;
    }

    const step = () => {
        if (age > AGE_LIMIT) {
            randomSet();
            age = 0;
        }
        geometry = new THREE.Geometry();
        for (let i = 0; i < CELL_SIZE; i++) {
            for (let j = 0; j < CELL_SIZE; j++) {
                for (let k = 0; k < CELL_SIZE; k++) {
                    if (judge(i, j, k)) {
                        matrix.makeTranslation(
                            10 * (i - CELL_SIZE / 2),
                            10 * (j - CELL_SIZE / 2),
                            10 * (k - CELL_SIZE / 2)
                        );
                        geometry.merge(cellGeometry, matrix);
                        bufferState[i][j][k] = 1;
                        deadFlag = false;
                    }
                    else {
                        bufferState[i][j][k] = 0;
                    }

                }
            }
        }

        mesh.geometry.dispose();
        mesh.geometry = geometry;
        currentState = Array.from(JSON.parse(JSON.stringify(bufferState)));
        age++;
    }

    let autoStep;
    const startAutoStep = () => {
        clearInterval(autoStep);
        autoStep = setInterval(
            step
            , 1000);
    }


    const stopAutoStep = () => {
        clearInterval(autoStep);
    }


    window.onresize = function () {

        let width = window.innerWidth;
        let height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        composer.setSize(width, height);

    };


    document.body.appendChild(WEBVR.createButton(renderer));
    randomSet();
    startAutoStep();
}
