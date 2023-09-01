import * as THREE from 'three';
import { camelCase } from 'lodash';
import { obstacleColorMapping } from '../constant/common';
import { disposeMesh, drawArrow, drawImge, disposeGroup, drawBox, drawDashedBox, drawSolidBox } from '../utils/common';
import iconObjectYield from '../../assets/images/decision/object-yield.png';

const DEFAULT_HEIGHT = 1.5;
enum ObjectType {
    UNKNOWN = 0,
    UNKNOWN_MOVABLE = 1,
    UNKNOWN_UNMOVABLE = 2,
    PEDESTRIAN = 3,
    BICYCLE = 4,
    VEHICLE = 5,
    VIRTUAL = 6,
    CIPV = 7,
}

function getSensorType(key) {
    if (key.search('radar') !== -1) {
        return 'RadarSensor';
    }
    if (key.search('lidar') !== -1 || key.search('velodyne') !== -1) {
        return 'LidarSensor';
    }
    if (key.search('camera') !== -1) {
        return 'CameraSensor';
    }
    return null;
}

export default class Obstacles {
    private obstacleMeshs;

    private speedHeadingArrows;

    private obstacleHeadingArrows;

    private textMeshs;

    private iconMeshs;

    private iconMeshTemplate;

    private scene;

    private view;

    private text;

    private solidFaceCubeMeshTemplate;

    private option;

    private coordinates;

    constructor(scene, view, text, option, coordinates) {
        this.scene = scene;
        this.view = view;
        this.text = text;
        this.option = option;
        this.coordinates = coordinates;
        this.obstacleMeshs = [];
        this.speedHeadingArrows = [];
        this.obstacleHeadingArrows = [];
        this.textMeshs = [];
        this.iconMeshs = [];
        this.iconMeshTemplate = null;
        this.solidFaceCubeMeshTemplate = null;

        this.drawIconMeshTemplate();
        this.drawCubeTemplate();
    }

    drawObstacleHeading(obstacle) {
        const { height, positionX, positionY, heading } = obstacle;
        const position = this.coordinates.applyOffset({ x: positionX, y: positionY });
        const color = 0xffffff;
        const arrowMesh = drawArrow(color);
        arrowMesh.rotateZ(heading);
        arrowMesh.position.set(position.x, position.y, (height || DEFAULT_HEIGHT) / 2);
        return arrowMesh;
    }

    drawSpeedHeading(obstacle) {
        const { height, positionX, positionY, type, speedHeading, speed } = obstacle;
        const position = this.coordinates.applyOffset({ x: positionX, y: positionY });
        const color = obstacleColorMapping[ObjectType[type]] || obstacleColorMapping.DEFAULT;
        const arrowMesh = drawArrow(color);
        arrowMesh.rotateZ(speedHeading);
        const scale = 1 + Math.log2(speed);
        arrowMesh.scale.set(scale, scale, scale);
        arrowMesh.position.set(position.x, position.y, (height || DEFAULT_HEIGHT) / 2);
        return arrowMesh;
    }

    drawTrafficCone(obstacle) {
        const { positionX, positionY, positionZ } = obstacle;
        const position = this.coordinates.applyOffset({ x: positionX, y: positionY });
        const geometry = new THREE.CylinderGeometry(0.1, 0.25, 0.914, 32);
        const material = new THREE.MeshBasicMaterial({
            color: obstacleColorMapping.TRAFFICCONE,
            transparent: true,
            opacity: 0.64,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.set(Math.PI / 2, 0, 0);
        mesh.position.set(position.x, position.y, positionZ);
        return mesh;
    }

    update(obstacles, measurements, autoDrivingCar) {
        this.dispose();
        this.updateObstacles(obstacles, autoDrivingCar);
        this.updateSensorMeasurements(measurements);
    }

    updateObstacles(obstacles, autoDrivingCar) {
        if (!this.coordinates.isInitialized()) {
            return;
        }
        const { obstacleHeading, obstacleDistanceAndSpeed } = this.option.layerOption.Perception;
        for (let i = 0; i < obstacles.length; i += 1) {
            const obstacle = obstacles[i];
            const { positionX, positionY, yieldedobstacle, type } = obstacle;
            if (!positionX || !positionY) {
                continue;
            }
            if (!this.option.layerOption.Perception[camelCase(ObjectType[type])]) {
                continue;
            }

            const mesh = this.drawObstacle(obstacle);
            if (!mesh) {
                return;
            }
            if (mesh) {
                this.scene.add(mesh);
                this.obstacleMeshs.push(mesh);
            }

            if (obstacleHeading) {
                const obstacleHeadingArrow = this.drawObstacleHeading(obstacle);
                if (obstacleHeadingArrow) {
                    this.obstacleHeadingArrows.push(obstacleHeadingArrow);
                    this.scene.add(obstacleHeadingArrow);
                }
            }

            if (obstacleDistanceAndSpeed) {
                const speedHeadingArrow = this.drawSpeedHeading(obstacle);
                if (speedHeadingArrow) {
                    this.speedHeadingArrows.push(speedHeadingArrow);
                    this.scene.add(speedHeadingArrow);
                }
            }

            if (yieldedobstacle) {
                const icon = this.iconMeshTemplate.clone();
                let position = new THREE.Vector3(positionX, positionY, (obstacle.height || DEFAULT_HEIGHT) + 0.5);
                position = this.coordinates.applyOffset(position);
                icon.position.set(position.x, position.y, position.z);
                this.scene.add(icon);
                this.iconMeshs.push(icon);
            }
            const texts = this.drawTexts(obstacle, autoDrivingCar);
            texts.forEach((mesh) => {
                this.textMeshs.push(mesh);
                this.scene.add(mesh);
            });
        }
    }

    updateSensorMeasurements(sensorMeasurements) {
        if (!this.coordinates.isInitialized()) {
            return;
        }
        const { lidar, radar, camera, obstacleHeading } = this.option.layerOption.Perception;
        if (!lidar && !radar && !camera) {
            return;
        }
        if (!sensorMeasurements) {
            return;
        }
        Object.keys(sensorMeasurements).forEach((key) => {
            const sensorType = getSensorType(key.toLowerCase());
            if (!sensorType || !this.option.layerOption.Perception[sensorType]) {
                return;
            }
            const measurements = sensorMeasurements[key]?.sensorMeasurement;
            if (!measurements || measurements.length === 0) {
                return;
            }
            measurements.forEach((item) => {
                if (!item.positionX || !item.positionY) {
                    return;
                }
                if (obstacleHeading) {
                    const obstacleHeadingArrow = this.drawObstacleHeading(item);
                    this.obstacleHeadingArrows.push(obstacleHeadingArrow);
                    this.scene.add(obstacleHeadingArrow);
                }
                const mesh = this.drawObstacle(item);
                if (mesh) {
                    this.scene.add(mesh);
                    this.obstacleMeshs.push(mesh);
                }
            });
        });
    }

    dispose() {
        [
            ...this.obstacleHeadingArrows,
            ...this.speedHeadingArrows,
            ...this.obstacleMeshs,
            ...this.textMeshs,
            ...this.iconMeshs,
        ].forEach((mesh) => {
            if (mesh.type === 'Group') {
                disposeGroup(mesh);
            } else {
                disposeMesh(mesh);
            }
            this.scene.remove(mesh);
        });
        this.speedHeadingArrows = [];
        this.obstacleHeadingArrows = [];
        this.obstacleMeshs = [];
        this.iconMeshs = [];
        this.textMeshs = [];
        this.text.reset();
    }

    drawIconMeshTemplate() {
        const mesh = drawImge(iconObjectYield, 1, 1);
        this.iconMeshTemplate = mesh;
    }

    drawCubeTemplate() {
        const color = obstacleColorMapping.DEFAULT;
        const solidFaceCube = drawSolidBox(1, 1, 1, color);
        this.solidFaceCubeMeshTemplate = solidFaceCube;
    }

    drawObstaclePolygon(obstacle) {
        const { polygonPoint, height, confidence, source, type } = obstacle;
        const bottomPoints = this.coordinates.applyOffsetToArray(polygonPoint);
        const color = obstacleColorMapping[ObjectType[type]] || obstacleColorMapping.DEFAULT;
        const material = new THREE.LineBasicMaterial({
            color,
        });
        const dashMaterial = new THREE.LineDashedMaterial({ color });
        const isV2x = source === 'v2x';

        const group = new THREE.Group();
        // 绘制底面
        const bottomGeometry = new THREE.BufferGeometry().setFromPoints(bottomPoints);
        const bottomFace = new THREE.LineLoop(bottomGeometry, material);
        group.add(bottomFace);
        if (isV2x) {
            // 绘制顶面
            const topPoints = bottomPoints.map((item) => new THREE.Vector3(item.x, item.y, item.z + height));
            const topGeometry = new THREE.BufferGeometry().setFromPoints(topPoints);
            const topFace = new THREE.LineLoop(topGeometry, material);
            group.add(topFace);
            // 绘制底面和顶面的连接线
            for (let i = 0; i < topPoints.length; i += 1) {
                const geometry = new THREE.BufferGeometry().setFromPoints([topPoints[i], bottomPoints[i]]);
                const segmentMesh = new THREE.LineSegments(geometry, material);
                group.add(segmentMesh);
            }
        } else {
            // 绘制实部的顶面
            const solidTopPoints = bottomPoints.map(
                (item) => new THREE.Vector3(item.x, item.y, item.z + confidence * height),
            );
            const solidTopGeometry = new THREE.BufferGeometry().setFromPoints(solidTopPoints);
            const solidTopFace = new THREE.LineLoop(solidTopGeometry, material);
            group.add(solidTopFace);
            // 绘制底面和实部顶面的连接线
            for (let i = 0; i < solidTopPoints.length; i += 1) {
                const geometry = new THREE.BufferGeometry().setFromPoints([solidTopPoints[i], bottomPoints[i]]);
                const segmentMesh = new THREE.LineSegments(geometry, material);
                group.add(segmentMesh);
            }
            if (confidence < 1) {
                // 绘制虚部的顶面
                const dashTopPoints = bottomPoints.map((item) => new THREE.Vector3(item.x, item.y, item.z + height));
                const dashTopGeometry = new THREE.BufferGeometry().setFromPoints(dashTopPoints);
                const dashTopFace = new THREE.LineLoop(dashTopGeometry, dashMaterial);
                group.add(dashTopFace);
                // 绘制虚部顶部和实部顶面的虚线
                for (let i = 0; i < solidTopPoints.length; i += 1) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([dashTopPoints[i], solidTopPoints[i]]);
                    const segmentMesh = new THREE.LineSegments(geometry, dashMaterial);
                    group.add(segmentMesh);
                }
            }
        }
        return group;
    }

    drawObstacle(obstacle) {
        const { polygonPoint, length, width, height, source } = obstacle;
        const isV2x = source === 'v2x';
        let mesh = null;
        if (obstacle.subType === 'ST_TRAFFICCONE') {
            mesh = this.drawTrafficCone(obstacle);
        } else if (polygonPoint && polygonPoint.length > 0 && this.option.layerOption.Perception.polygon) {
            mesh = this.drawObstaclePolygon(obstacle);
        } else if (length && width && height && this.option.layerOption.Perception.boundingbox) {
            if (isV2x) {
                mesh = this.drawV2xCube(obstacle);
            } else {
                mesh = this.drawCube(obstacle);
            }
        }
        return mesh;
    }

    drawV2xCube(obstacle) {
        const { length, width, height, positionX, positionY, type, heading } = obstacle;
        const color = obstacleColorMapping[ObjectType[type]] || obstacleColorMapping.DEFAULT;
        const v2XCubeMesh = this.solidFaceCubeMeshTemplate.clone();
        const position = this.coordinates.applyOffset({
            x: positionX,
            y: positionY,
            z: (obstacle.height || DEFAULT_HEIGHT) / 2,
        });
        v2XCubeMesh.scale.set(length, width, height);
        v2XCubeMesh.position.set(position.x, position.y, position.z);
        v2XCubeMesh.material.color.setHex(color);
        v2XCubeMesh.children[0].material.color.setHex(color);
        v2XCubeMesh.rotation.set(0, 0, heading);
        return v2XCubeMesh;
    }

    drawCube(obstacle) {
        const group = new THREE.Group();
        const { length, width, height, positionX, positionY, type, heading, confidence = 0.5 } = obstacle;
        const color = obstacleColorMapping[ObjectType[type]] || obstacleColorMapping.DEFAULT;
        const position = this.coordinates.applyOffset({
            x: positionX,
            y: positionY,
        });
        if (confidence > 0) {
            const solidBox = drawBox(length, width, height * confidence, color);
            solidBox.position.z = ((height || DEFAULT_HEIGHT) / 2) * confidence;
            group.add(solidBox);
        }
        if (confidence < 1) {
            const dashBox = drawDashedBox(length, width, height * (1 - confidence), color);
            dashBox.position.z = ((height || DEFAULT_HEIGHT) / 2) * (1 - confidence);
            group.add(dashBox);
        }
        group.position.set(position.x, position.y, 0);
        group.rotation.set(0, 0, heading);
        return group;
    }

    drawTexts(obstacle, autoDrivingCar) {
        const { positionX, positionY, height, id, source } = obstacle;
        const { obstacleDistanceAndSpeed, obstacleId, obstaclePriority, obstacleInteractiveTag, v2x } =
            this.option.layerOption.Perception;
        const isBirdView = this.view.viewType === 'Overhead' || this.view.viewType === 'Map';
        const isV2x = source === 'v2x';
        const textMeshs = [];
        const { positionX: adcX, positionY: adcY, heading: adcHeading } = autoDrivingCar;
        const adcPosition = new THREE.Vector3(adcX, adcY, 0);
        const obstaclePosition = new THREE.Vector3(positionX, positionY, (height || DEFAULT_HEIGHT) / 2);
        const initPosition = this.coordinates.applyOffset({
            x: positionX,
            y: positionY,
            z: height || DEFAULT_HEIGHT,
        });
        const lineSpacing = 0.5;
        const deltaX = isBirdView ? 0.0 : lineSpacing * Math.cos(adcHeading);
        const deltaY = isBirdView ? 0.7 : lineSpacing * Math.sin(adcHeading);
        const deltaZ = isBirdView ? 0.0 : lineSpacing;
        let lineCount = 0;

        if (obstacleDistanceAndSpeed) {
            const distance = adcPosition.distanceTo(obstaclePosition).toFixed(1);
            const speed = obstacle.speed.toFixed(1);
            const speedAndDistanceText = this.text.drawText(`(${distance}m,${speed}m/s)`, 0xffea00, initPosition);
            if (speedAndDistanceText) {
                textMeshs.push(speedAndDistanceText);
                lineCount += 1;
            }
        }

        if (obstacleId) {
            const idPosition = {
                x: initPosition.x + lineCount * deltaX,
                y: initPosition.y + lineCount * deltaY,
                z: initPosition.z + lineCount * deltaZ,
            };
            const idText = this.text.drawText(id, 0xffea00, idPosition);
            if (idText) {
                textMeshs.push(idText);
                lineCount += 1;
            }
        }

        if (obstaclePriority) {
            const priority = obstacle.obstaclePriority?.priority;
            if (priority && priority !== 'NORMAL') {
                const priorityPosition = {
                    x: initPosition.x + lineCount * deltaX,
                    y: initPosition.y + lineCount * deltaY,
                    z: initPosition.z + lineCount * deltaZ,
                };
                const priorityText = this.text.drawText(priority, 0xffea00, priorityPosition);
                if (priorityText) {
                    textMeshs.push(priorityText);
                    lineCount += 1;
                }
            }
        }

        if (obstacleInteractiveTag) {
            const interactiveTag = obstacle.interactiveTag?.interactiveTag;
            if (interactiveTag && interactiveTag !== 'NONINTERACTION') {
                const interactiveTagPosition = {
                    x: initPosition.x + lineCount * deltaX,
                    y: initPosition.y + lineCount * deltaY,
                    z: initPosition.z + lineCount * deltaZ,
                };
                const interactiveTagText = this.text.drawText(interactiveTag, 0xffea00, interactiveTagPosition);
                if (interactiveTagText) {
                    textMeshs.push(interactiveTagText);
                    lineCount += 1;
                }
            }
        }

        if (isV2x && v2x) {
            const v2xType = obstacle.v2xInfo?.v2xType;
            if (v2xType) {
                v2xType.forEach((t) => {
                    const v2xTypePosition = {
                        x: initPosition.x + lineCount * deltaX,
                        y: initPosition.y + lineCount * deltaY,
                        z: initPosition.z + lineCount * deltaZ,
                    };
                    const v2xTypeText = this.text.drawText(t, 0xffea00, v2xTypePosition);
                    if (v2xTypeText) {
                        textMeshs.push(v2xTypeText);
                        lineCount += 1;
                    }
                });
            }
        }
        return textMeshs;
    }
}
