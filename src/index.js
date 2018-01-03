const angular = require("angular");

const bip39 = require("bip39");
const HDNode = require("./util/hdnode");
const nem = require("nem-sdk").default;

const MAXIMUM_ACCOUNTS = 10;

const app = angular.module("App", [
    require("angular-animate"),
    require("angular-aria"),
    require("angular-file-saver"),
    require("angular-material"),
    require("angular-material-data-table"),
]);

app.directive("validateMnemonic", () => ({
    require: "ngModel",
    link (scope, element, attrs, ngModel) {
        ngModel.$parsers.push((viewValue) => {
            const modelValue = viewValue
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ");

            return modelValue;
        });

        ngModel.$validators.mnemonic = (modelValue, viewValue) => {
            const mnemonic = modelValue || viewValue;

            return bip39.validateMnemonic(mnemonic);
        };
    }
}));

const bip44 = (network, index) => {
    const coinType = (network == -104) ? 1 : 43;

    return `m/44'/${coinType}'/${index}'/0'/0'`;
};

const buildAccounts = (mnemonic, passphrase, network) => {
    const seed = bip39.mnemonicToSeed(mnemonic, passphrase);
    const root = HDNode.fromSeedBuffer(seed);

    return Array.apply(null, Array(MAXIMUM_ACCOUNTS)).map((_, i) => {
        const hdKeypath = bip44(network, i);
        const node = root.derivePath(hdKeypath);

        const secretKey = nem.utils.convert.hex2ua_reversed(node.getPrivateKeyHex());

        const privateKey = nem.utils.convert.ua2hex(secretKey);
        const keyPair = nem.crypto.keyPair.create(privateKey);
        const publicKey = keyPair.publicKey.toString();
        const address = nem.model.address.toAddress(publicKey, network);

        return {
            hdKeypath,
            address,
            privateKey,
            publicKey,
        }
    });
};

const createWallet = (walletName, password, accounts, network) => {
    const wallet = nem.model.wallet.importPrivateKey(walletName, password, accounts[0].privateKey, network);

    for (let i = 1; i < accounts.length; i++) {
        const { address, privateKey } = accounts[i];

        const label = `Account ${i + 1}`;

        const { encrypted, iv } = nem.crypto.helpers.encodePrivKey(privateKey, password);
        wallet.accounts[i] = nem.model.objects.create("account")(address, label, null, encrypted, iv);
    }

    return wallet;
};

const createWalletFile = (wallet) => {
    const encoded = angular.toJson(wallet);

    return btoa(encoded);
};

app.controller("MainCtrl", ["$scope", "FileSaver", "Blob", ($scope, FileSaver, Blob) => {
    $scope.formData = {
        network: 104
    };

    $scope.$watch("formData", (formData) => {
        if (formData.mnemonic) {
            $scope.accounts = buildAccounts(formData.mnemonic, formData.passphrase, formData.network);
        } else {
            $scope.accounts = null;
        }
    }, true);

    $scope.downloadWallet = () => {
        const wallet = createWallet($scope.walletName, $scope.password, $scope.accounts, $scope.formData.network);
        const data = createWalletFile(wallet);

        const object = new Blob([data]);
        const filename = `${$scope.walletName}.wlt`;
        FileSaver.saveAs(object, filename);
    };
}]);
