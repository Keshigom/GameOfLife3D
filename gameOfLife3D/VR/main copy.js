// ページの読み込みを待つ
window.addEventListener('load', init);
function init() {
    // サイズを指定
    const width = 960;
    const height = 540;
    // 1辺あたりに配置するオブジェクトの個数
    const CELL_NUM = 25;


    //
    let currentState = Array.from(new Array(CELL_NUM), () => {
        return Array.from(new Array(CELL_NUM), () => new Array(CELL_NUM).fill(0))
    });

    let bufferState = Array.from(JSON.parse(JSON.stringify(currentState)));



    var params = {
        exposure: 1.15,
        bloomStrength: 0.35,
        bloomThreshold: 0.11,
        bloomRadius: 0
    };


    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.vr.enabled = true;

    // シーンを作成
    const scene = new THREE.Scene();
    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 100;
    controls.maxDistance = 1000;
    camera.position.set(0, 0, 500);

    //light
    scene.add(new THREE.AmbientLight(0x404040));
    pointLight = new THREE.PointLight(0xffffff, 1);
    camera.add(pointLight);

    //post
    var renderScene = new THREE.RenderPass(scene, camera);

    var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);


    // 空のジオメトリを作成
    let geometry = new THREE.Geometry();
    // Box
    const sampleGeometry = new THREE.BoxGeometry(8, 8, 8);
    const matrix = new THREE.Matrix4();


    // for (let i = 0; i < CELL_NUM; i++) {
    //     for (let j = 0; j < CELL_NUM; j++) {
    //         for (let k = 0; k < CELL_NUM; k++) {
    //             // 立方体個別の要素を作成
    //             // 座標調整の行列を作成
    //             matrix.makeTranslation(
    //                 10 * (i - CELL_NUM / 2),
    //                 10 * (j - CELL_NUM / 2),
    //                 10 * (k - CELL_NUM / 2)
    //             );
    //             // ジオメトリをマージ（結合）
    //             geometry.merge(sampleGeometry, matrix);

    //         }
    //     }
    // }

    // マテリアルを作成
    const material = new THREE.MeshNormalMaterial();
    // const material = new THREE.MeshLambertMaterial({ color: 0x009900 });
    // メッシュを作成
    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);
    // フレームレートの数値を画面に表示
    // const stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.marginLeft = "5px";
    // stats.domElement.style.top = '10px';
    // document.body.appendChild(stats.domElement);

    tick();
    // 毎フレーム時に実行されるループイベントです
    function tick() {
        mesh.rotation.x += Math.PI / 1800;
        mesh.rotation.y += Math.PI / 1800;
        // レンダリング
        renderer.render(scene, camera);

        // フレームレートを表示
        // stats.update();
        composer.render();
        renderer.setAnimationLoop(tick);

        //requestAnimationFrame(tick);
    }


    const judge = (x, y, z) => {
        let judgeValue = 0;
        const START = -1;
        const END = 2;
        for (let i = START; i < END; i++) {
            if ((x + i) < 0 || (x + i) >= CELL_NUM) {
                continue;
            }

            for (let j = START; j < END; j++) {
                if ((y + j) < 0 || (y + j) >= CELL_NUM) {
                    continue;
                }

                for (let k = START; k < END; k++) {
                    if ((z + k) < 0 || (z + k) >= CELL_NUM) {
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
        for (let i = 0; i < CELL_NUM; i++) {
            for (let j = 0; j < CELL_NUM; j++) {
                for (let k = 0; k < CELL_NUM; k++) {

                    if (Math.random() >= 0.75) {
                        // 立方体個別の要素を作成
                        // 座標調整の行列を作成
                        matrix.makeTranslation(
                            10 * (i - CELL_NUM / 2),
                            10 * (j - CELL_NUM / 2),
                            10 * (k - CELL_NUM / 2)
                        );
                        // ジオメトリをマージ（結合）
                        geometry.merge(sampleGeometry, matrix);

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
        let deadFlag = true;
        geometry = new THREE.Geometry();
        for (let i = 0; i < CELL_NUM; i++) {
            for (let j = 0; j < CELL_NUM; j++) {
                for (let k = 0; k < CELL_NUM; k++) {
                    if (judge(i, j, k)) {
                        // 座標調整の行列を作成
                        matrix.makeTranslation(
                            10 * (i - CELL_NUM / 2),
                            10 * (j - CELL_NUM / 2),
                            10 * (k - CELL_NUM / 2)
                        );
                        // ジオメトリをマージ（結合）
                        geometry.merge(sampleGeometry, matrix);
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
        if (deadFlag) randomSet();
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

        var width = window.innerWidth;
        var height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        composer.setSize(width, height);

    };

    //gui
    var gui = new dat.GUI();

    gui.add(params, 'exposure', 0.1, 2).step(0.01).onChange(function (value) {

        renderer.toneMappingExposure = Math.pow(value, 4.0);

    });

    gui.add(params, 'bloomThreshold', 0.0, 1.0).step(0.01).onChange(function (value) {

        bloomPass.threshold = Number(value);

    });

    gui.add(params, 'bloomStrength', 0.0, 3.0).step(0.01).onChange(function (value) {

        bloomPass.strength = Number(value);

    });

    gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {

        bloomPass.radius = Number(value);

    });

    gui.add({ random: randomSet }, 'random');
    gui.add({ step: step }, 'step');
    gui.add({ start: startAutoStep }, 'start');
    gui.add({ stop: stopAutoStep }, 'stop');

    document.body.appendChild(WEBVR.createButton(renderer));
    randomSet();
    startAutoStep();


}
window.addEventListener('load', init);
function init() {

    const CELL_SIZE = 25;
    const GENERATE_PROBABILITY = 0.25;


    let currentState = Array.from(new Array(CELL_SIZE), () => {
        return Array.from(new Array(CELL_SIZE), () => new Array(CELL_SIZE).fill(0))
    });
    let bufferState = Array.from(JSON.parse(JSON.stringify(currentState)));

    let params = {
        exposure: 1.15,
        bloomStrength: 0.35,
        bloomThreshold: 0.11,
        bloomRadius: 0
    };

    // ------
    // Init Three
    // ------

    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;

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
    pointLight = new THREE.PointLight(0xffffff, 1);
    camera.add(pointLight);

    //postprocess
    let renderScene = new THREE.RenderPass(scene, camera);

    let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    let composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    let geometry = new THREE.Geometry();
    const cellGeometry = new THREE.BoxGeometry(8, 8, 8);
    const matrix = new THREE.Matrix4();
    const material = new THREE.MeshNormalMaterial();
    // const material = new THREE.MeshLambertMaterial({ color: 0x009900 });
    const mesh = new THREE.Mesh(geometry, material);

    // stats
    scene.add(mesh);
    const stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.marginLeft = "5px";
    stats.domElement.style.top = '10px';
    document.body.appendChild(stats.domElement);

    // main loop 
    tick();
    function tick() {
        mesh.rotation.x += Math.PI / 1800;
        mesh.rotation.y += Math.PI / 1800;
        // レンダリング
        renderer.render(scene, camera);

        // フレームレートを表示
        stats.update();
        composer.render();
        renderer.setAnimationLoop(tick);

        //requestAnimationFrame(tick);
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

    //gui
    let gui = new dat.GUI();

    gui.add(params, 'exposure', 0.1, 2).step(0.01).onChange(function (value) {

        renderer.toneMappingExposure = Math.pow(value, 4.0);

    });

    gui.add(params, 'bloomThreshold', 0.0, 1.0).step(0.01).onChange(function (value) {

        bloomPass.threshold = Number(value);

    });

    gui.add(params, 'bloomStrength', 0.0, 3.0).step(0.01).onChange(function (value) {

        bloomPass.strength = Number(value);

    });

    gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {

        bloomPass.radius = Number(value);

    });

    gui.add({ "ランダム生成": randomSet }, "ランダム生成");
    gui.add({ "1世代進める": step }, "1世代進める");
    gui.add({ "再生": startAutoStep }, "再生");
    gui.add({ "停止": stopAutoStep }, "停止");

}
