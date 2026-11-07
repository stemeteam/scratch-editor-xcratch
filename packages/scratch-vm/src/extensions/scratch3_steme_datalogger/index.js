class Scratch3STEMEdatalogger {
    constructor(runtime) {
        this.runtime = runtime;
        // Cấu hình các UUID tiêu chuẩn của Nordic NUS
        this.serviceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
        this.txCharacteristicUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // Scratch -> ESP32
        this.rxCharacteristicUUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // ESP32 -> Scratch

        this.device = null;
        this.txCharacteristic = null;
        this.latestReceivedData = ""; // Biến lưu trữ dữ liệu mới nhất từ ESP32
    }

    getInfo() {
        return {
            id: "esp32bletwoway",
            name: "ESP32 Song Hành",
            blocks: [
                {
                    opcode: "connectDevice",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Kết nối ESP32 Bluetooth",
                },
                {
                    opcode: "sendData",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Gửi dữ liệu [TEXT] tới ESP32",
                    arguments: {
                        TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "ON",
                        },
                    },
                },
                {
                    opcode: "getReceivedData",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "Dữ liệu nhận từ ESP32",
                },
            ],
        };
    }

    connectDevice() {
        return navigator.bluetooth
            .requestDevice({
                filters: [{ namePrefix: "ESP32_Scratch" }],
                optionalServices: [this.serviceUUID],
            })
            .then((device) => {
                this.device = device;
                return device.gatt.connect();
            })
            .then((server) => server.getPrimaryService(this.serviceUUID))
            .then((service) => {
                // 1. Lấy kênh truyền dữ liệu ĐI (TX)
                service
                    .getCharacteristic(this.txCharacteristicUUID)
                    .then((char) => {
                        this.txCharacteristic = char;
                    });

                // 2. Lấy kênh nhận dữ liệu VỀ (RX) và bật Notify
                return service.getCharacteristic(this.rxCharacteristicUUID);
            })
            .then((rxChar) => {
                return rxChar.startNotifications().then(() => {
                    rxChar.addEventListener(
                        "characteristicvaluechanged",
                        (event) => {
                            const value = event.target.value;
                            const decoder = new TextDecoder("utf-8");
                            this.latestReceivedData = decoder.decode(value);
                            console.log(
                                "Nhận từ ESP32:",
                                this.latestReceivedData,
                            );
                        },
                    );
                });
            })
            .then(() => {
                console.log("Đã kết nối 2 chiều thành công!");
            })
            .catch((error) => {
                console.error("Lỗi kết nối:", error);
            });
    }

    sendData(args) {
        if (!this.txCharacteristic) return;
        const encoder = new TextEncoder();
        const data = encoder.encode(args.TEXT);
        return this.txCharacteristic.writeValue(data);
    }

    getReceivedData() {
        return this.latestReceivedData; // Trả về giá trị cho khối tròn trong Scratch
    }
}

Scratch.extensions.register(new Scratch3ESP32BLETwoWay());
