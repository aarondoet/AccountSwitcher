//META{"name":"AccountSwitcher","displayName":"AccountSwitcher","website":"https://l0c4lh057.jg-p.eu/","source":"https://github.com/l0c4lh057/AccountSwitcher/blob/master/AccountSwitcher.plugin.js"}*//

let passwd = null;
let crypto = require("crypto");
let AccountManager, UserInfoStore, UserStore, Settings, Toasts;
let registerKeybind, unregisterKeybind;
let KeybindModule, KeyRecorder, Keybind;

class AccountSwitcher {
	getName(){return "AccountSwitcher";}
	getAuthor(){return "l0c4lh057";}
	getVersion(){return "1.2.6";}
    getDescription(){return "Simply switch between accounts with the ease of pressing a single key.";}

    constructor(){}

    get defaultSettings(){
        return {
            accounts: [],
            language: "auto",
            encrypted: false,
            showChangelog: true,
            lastUsedVersion: "0.0.0",
            encTest: "test"
        }
    }

    load(){
		if(!document.getElementById("0b53rv3r5cr1p7")){
			let observerScript = document.createElement("script");
			observerScript.id = "0b53rv3r5cr1p7";
			observerScript.type = "text/javascript";
			observerScript.src = "https://l0c4lh057.github.io/BetterDiscord/Plugins/Scripts/pluginlist.js";
			document.head.appendChild(observerScript);
		}
	}
    start(){
        passwd = null;
        var libraryScript = document.getElementById("ZLibraryScript");
		if (!libraryScript || !window.ZLibrary) {
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://rauenzi.github.io/BDPluginLibrary/release/ZLibrary.js");
			libraryScript.setAttribute("id", "ZLibraryScript");
			document.head.appendChild(libraryScript);
		}
		if (window.ZLibrary) this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
    }
    stop(){
        this.settings.accounts.forEach(acc => this.unregisterKeybind(acc));
        document.removeEventListener("auxclick", e=>this.openMenu(e));
        ZLibrary.PluginUtilities.removeStyle("accountswitcher-style")
    }

    initialize(){
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), "https://raw.githubusercontent.com/l0c4lh057/AccountSwitcher/master/AccountSwitcher.plugin.js")
        this.loadSettings();
        AccountManager = ZLibrary.DiscordModules.AccountManager;
        UserInfoStore = ZLibrary.DiscordModules.UserInfoStore;
        UserStore = ZLibrary.DiscordModules.UserStore;
        Settings = ZLibrary.Settings;
        Toasts = ZLibrary.Toasts;
        unregisterKeybind = ZLibrary.WebpackModules.getByProps('inputEventUnregister').inputEventUnregister.bind(ZLibrary.WebpackModules.getByProps('inputEventUnregister'));
        registerKeybind = ZLibrary.WebpackModules.getByProps('inputEventRegister').inputEventRegister.bind(ZLibrary.WebpackModules.getByProps('inputEventUnregister'));
        KeyRecorder = class KeyRecorder extends ZLibrary.WebpackModules.getByDisplayName('KeyRecorder') {
            render() {
                const ButtonOptions = ZLibrary.WebpackModules.getByProps('ButtonLink');
                const Button = ButtonOptions.default;
                const GetClass = arg => {
                    const args = arg.split(' ');
                    return ZLibrary.WebpackModules.getByProps(...args)[args[args.length - 1]];
                };
                const ret = super.render();
                ret.props.children.props.children.push(
                    ZLibrary.DiscordModules.React.createElement(
                        ZLibrary.DiscordModules.FlexChild,
                        {
                            style: { margin: 0 } 
                        },
                        ZLibrary.DiscordModules.React.createElement(
                            Button,
                            {
                                className: GetClass('editIcon button').split(' ')[1],
                                size: Button.Sizes.MIN,
                                color: ButtonOptions.ButtonColors.GREY,
                                look: ButtonOptions.ButtonLooks.GHOST,
                                onClick: this.props.onRemove
                            },
                            'Remove'
                        )
                    )
                );
                return ret;
            }
        };
        KeybindModule = class KeybindModule extends ZLibrary.DiscordModules.Keybind {
            constructor(props) {
                super(props);
            }
            render() {
                const ret = super.render();
                ret.type = KeyRecorder;
                ret.props.account = this.props.account;
                ret.props.onRemove = this.props.onRemove;
                return ret;
            }
        };
        Keybind = class Keybind extends ZLibrary.Settings.SettingField {
            constructor(account, onChange, onRemove) {
                super(account.name + " (" + account.id + ")", "", onChange, KeybindModule, {
                    defaultValue: (account.keybind[0] !== -1 && account.keybind.map(a => [0, a])) || [],
                    onChange: element => value => {
                        if (!Array.isArray(value)) return;
                        element.props.value = value;
                        this.onChange(value.map(a => a[1]));
                    },
                    account,
                    onRemove
                });
            }
        };
        
        this.settings.accounts.forEach(acc => this.registerKeybind(acc));
        
        if(this.settings.lastUsedVersion != this.getVersion()){
            this.settings.lastUsedVersion = this.getVersion();
            this.saveSettings();
            if(!this.settings.showChangelog) return;
            this.alertText("Changelog", `<ul style="list-style-type:circle;padding-left:20px;">
                <li>MERRY CHRISTMAS EVERYONE!!!</li>
                <li>AccountSwitcher got completely rewritten.</li>
                <li>It is now using ZLibrary instead of NeatoLib which means it will break less often.</li>
                <li>You can now save more than ten accounts and SET CUSTOM KEYBINDS for each of them.</li>
                <li>I hope that everything is working the way it should. Since the plugin is now using a different method to save accounts the settings file needs to be parsed and because it is now using Node's crypto module instead of CryptoJS there could have been problems when parsing the settings and therefore you might have lost your saved accounts, but I tried to make it work correctly. If you have kept your accounts and everything was working the way it should the password is still the same as before.</li>
                <li>Currently the language support got dropped for this update, but I will try to add this again as soon as possible.</li>
            </ul>`);
        }
        
        if(typeof this.settings.token1 == "string"){
            let cryptLib = document.getElementById("accountswitcher-cryptlib");
            if(!cryptLib){
                cryptLib = document.createElement("script");
                cryptLib.id = "accountswitcher-cryptlib";
                cryptLib.type = "text/javascript";
                cryptLib.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js";
                document.head.appendChild(cryptLib);
            }
            if(typeof window.CryptoJS == "object") this.convertOldStyleSettings(this.settings);
            else cryptLib.addEventListener("load", ()=>{this.convertOldStyleSettings(this.settings)});
        }
        
        document.addEventListener("auxclick", e=>this.openMenu(e));
        
        ZLibrary.PluginUtilities.addStyle("accountswitcher-style", `
            .accountswitcher-switchmenu {
                position: fixed;
                width: auto;
                height: auto;
                background-color: #202225;
                border-radius: 10px;
                overflow: hidden;
                z-index: 1000;
            }
            .accountswitcher-accountwrapper {
                position: relative;
                display: inline-block;
                margin: 10px;
                width: 64px;
                height: 64px;
            }
            .accountswitcher-menuavatar {
                width: 64px;
                height: 64px;
            }
            .accountswitcher-removeaccount {
                position: absolute;
                top: -4px;
                right: -4px;
                background-color: #111;
                width: 1em;
                height: 1em;
                border-radius: 0.5em;
                color: #ccc;
                text-align: center;
                border: 2px solid #444;
            }
            .accountswitcher-settingsbtnwrapper {
                right: 0;
                position: absolute;
            }
        `);
    }
    
    openMenu(e){
        if(e.which != 2) return;
        if(!e.target || !e.target.classList) return;
        if(!e.target.classList.contains(ZLibrary.WebpackModules.getByProps("avatar", "container", "nameTag").avatar.split(" ")[0])) return;
        let menu = document.createElement("div");
        menu.className = "accountswitcher-switchmenu";
        menu.style = "bottom:" + (e.target.offset().bottom - e.target.offset().top + 27) + "px;left:" + (e.target.offset().left - 5) + "px;";
        this.settings.accounts.forEach(a => {
            let wrapper = document.createElement("div");
            wrapper.className = "accountswitcher-accountwrapper";
            let av = document.createElement("img");
            av.className = "accountswitcher-menuavatar";
            av.src = a.avatar;
            av.addEventListener("click", ()=>this.login(a));
            let rm = document.createElement("div");
            rm.className = "accountswitcher-removeaccount";
            rm.innerText = "X";
            rm.on("click", ()=>{
                // TODO: remove account
                Toasts.show("This function is not available yet.", {type: Toasts.ToastTypes.warning});
            });
            av.appendTo(wrapper);
            rm.appendTo(wrapper);
            menu.appendChild(wrapper);
            // TODO: Add tooltip when it is working again
            //new ZLibrary.Tooltip(av, a.name);
            //new ZLibrary.Tooltip(rm, "Remove Account");
        });
        document.body.appendChild(menu);
        let l = (e2)=>{
            if(!e2.target || !e2.target.classList) return;
            if(!e2.target.classList.contains("accountswitcher-switchmenu") && !e2.target.classList.contains("accountswitcher-removeaccount")){
                menu.outerHTML = "";
                document.body.removeEventListener("click", l);
            }
        };
        document.body.addEventListener("click", l);
    }

    async requireOldPassword(encTest, encrypted){
        if(!encrypted) return null;
        return new Promise((resolve, reject)=>{
            let retry = t=>{
                if(t>0) Toasts.show("Wrong password", {type: Toasts.ToastTypes.error});
                this.alertText("The method to encrypt data got changed.", `Please type in your password again. If you abort this action you will lose all the accounts you currently have saved.<br><br><input id="accountswitcher-passwordinput" type="password">`, ()=>{
                    try{
                        let pw = document.getElementById("accountswitcher-passwordinput").value;
                        if(CryptoJS.AES.decrypt(encTest, pw).toString(CryptoJS.enc.Utf8) != "test") return retry(t+1);
                        resolve(pw);
                    }catch(ex){
                        retry(t+1);
                    }
                }, ()=>{
                    resolve(undefined);
                });
            };
            retry(0);
        })
    }
    
	alertText(e, t, callbackOk, callbackCancel) {
		let backdrop = $(`<div class="backdrop-1wrmKB da-backdrop" style="opacity: 0.85; background-color: rgb(0, 0, 0); z-index: 1000; transform: translateZ(0px);"></div>`);
		let a =  $(`<div class="modal-3c3bKg da-modal" style="opacity: 1; transform: scale(1) translateZ(0px); z-index: 9999999">
						<div data-focus-guard="true" tabindex="0" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
						<div data-focus-guard="true" tabindex="1" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
						<div data-focus-lock-disabled="false" class="inner-1ilYF7 da-inner">
							<div class="modal-yWgWj- da-modal container-14fypd da-container sizeSmall-1jtLQy">
								<div class="scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix da-scrollerWrap da-firefoxFixScrollFlex content-1EtbQh da-content scrollerThemed-2oenus da-scrollerThemed themeGhostHairline-DBD-2d">
									<div class="scroller-2FKFPG firefoxFixScrollFlex-cnI2ix da-scroller da-firefoxFixScrollFlex systemPad-3UxEGl da-systemPad inner-ZyuQk0 da-inner content-dfabe7 da-content">
										<h2 class="h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi da-h2 da-title da-size16 da-height20 da-weightSemiBold defaultColor-1_ajX0 da-defaultColor title-18-Ds0 marginBottom20-32qID7 marginTop8-1DLZ1n da-title da-marginBottom20 da-marginTop8">
											${e}
										</h2>
										<div class="body-Mj9Oxz da-body medium-zmzTW- size16-14cGz5 height20-mO2eIN primary-jw0I4K">
											${t}
										</div>
									</div>
								</div>
								<div class="flex-1xMQg5 flex-1O1GKY da-flex da-flex horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyBetween-2tTqYu alignStretch-DpGPf3 wrap-ZIn9Iy footer-3rDWdC da-footer" style="flex: 0 0 auto;">
									<button class="primaryButton-2BsGPp da-primaryButton button-38aScr da-button lookFilled-1Gx00P colorBrand-3pXr91 sizeXlarge-2yFAlZ grow-q77ONN da-grow">
										<div class="contents-18-Yxp da-contents">Okay</div>
									</button>
								</div>
							</div>
						</div>
						<div data-focus-guard="true" tabindex="0" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
					</div>`);
		a.find(".da-footer button").on("click", () => {
			if(typeof callbackOk === "function") callbackOk();
            a.remove();
            backdrop.remove();
		});
		backdrop.on("click", () => {
			if(typeof callbackCancel === "function") callbackCancel();
            a.remove();
            backdrop.remove();
		});
		let modalRoot = document.querySelector("#app-mount > div[data-no-focus-lock='true'] > div:not([class])");
		backdrop.appendTo(modalRoot);
		a.appendTo(modalRoot);
		if(a.find("#accountswitcher-passwordinput")){
			a.find("#accountswitcher-passwordinput").on("keydown", e => {
				if(e.which == 13) a.find(".da-footer button").click();
				else if(e.which == 27) backdrop.click();
			});
			a.find("#accountswitcher-passwordinput").focus();
		}
		return a.find("div.da-modal")[0];
	}

    async requirePassword(){
        if(passwd != null || !this.settings.encrypted) return;
        return new Promise((resolve, reject)=>{
            let retry = t=>{
                if(t>0) Toasts.show("Wrong password", {type: Toasts.ToastTypes.error});
                this.alertText("Password required", `<input id="accountswitcher-passwordinput" type="password">`, ()=>{
                    try{
                        let pw = document.getElementById("accountswitcher-passwordinput").value;
                        if(this.decrypt(this.settings.encTest, pw) != "test") return retry(t+1);
                        passwd = pw;
                        resolve();
                    }catch(ex){
                        retry(t+1);
                    }
                }, ()=>{
                    reject("Cancelled password input");
                });
            };
            retry(0);
        })
    }
    
    login(account){
        if(account.id == UserStore.getCurrentUser().id) return ZLibrary.Toasts.show("Already using account " + account.name, {type: Toasts.ToastTypes.warning});
        this.requirePassword().then(r => {
            let token = passwd == null ? account.token : this.decrypt(account.token, passwd);
            AccountManager.loginToken(this.decrypt(token, account.id));
        });
    }
    
    encrypt(text, password){
        let key = crypto.createCipher("aes-128-cbc", password);
        return key.update(text, "utf8", "hex") + key.final("hex");
    }
    
    decrypt(text, password){
        let key = crypto.createDecipher("aes-128-cbc", password);
        return key.update(text, "hex", "utf8") + key.final("utf8");
    }
    
    unregisterKeybind(account){
        unregisterKeybind("119" + account.id);
    }
    
    registerKeybind(account){
        registerKeybind("119" + account.id, account.keybind.map(a=>[0,a]), pressed => {
            this.login(account);
        }, {blurred: false, focused: true, keydown: true, keyup: false});
    }

    getSettingsPanel(){
        let panel = document.createElement("div");
        panel.className = "form";
        panel.style = "width:100%;"
        let accountsField = new Settings.SettingGroup("Accounts", {shown:true});
        let addAccount = account=>{
            if(!account){
                let u = UserStore.getCurrentUser();
                let acc = {
                    name: u.username + u.discriminator,
                    id: u.id,
                    avatar: u.avatarURL,
                    keybind: [64, 10+this.settings.accounts.length],
                    token: this.encrypt(this.settings.encrypted ? this.encrypt(UserInfoStore.getToken(), passwd) : UserInfoStore.getToken(), u.id)
                };
                this.settings.accounts.push(acc);
                this.saveSettings();
                this.registerKeybind(acc);
                return addAccount(acc);
            }
            let kbPanel = new Keybind(account, keybind => {
                        this.unregisterKeybind(account);
                        account.keybind = keybind;
                        this.saveSettings();
                        this.registerKeybind(account);
                    }, ()=>{
                        this.unregisterKeybind(account);
                        this.settings.accounts = this.settings.accounts.filter(acc => acc.id != account.id);
                        this.saveSettings();
                        // TODO: remove account from DOM so you are not required to repopen the settings
                        Toasts.show("Account " + account.name + " got removed. After reopening the settings it will also be gone from this list.", {type: Toasts.ToastTypes.success});                        
                    });
            accountsField.append(kbPanel);
        };
        let addAccountButton = document.createElement("button");
        addAccountButton.className = "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN";
        addAccountButton.addEventListener("click", ()=>{
            if(this.settings.accounts.some(acc => acc.id == UserStore.getCurrentUser().id)){
                return Toasts.show("You already saved this account", {type: Toasts.ToastTypes.error});
            }
            this.requirePassword().then(r => {
                addAccount();
            })
        });
        addAccountButton.innerText = "Save Account";
        new Settings.SettingGroup(this.getName(), {shown:true}).appendTo(panel)
                .append(
                    new Settings.Switch("Encrypt tokens", "Encrypting tokens makes sure that nobody will be able to get the tokens without knowing the password.", this.settings.encrypted, checked => {
                        if(checked == this.settings.encrypted) return;
                        if(checked){
                            let retry = ()=>{
                                this.alertText("Set password", `<input type="password" id="accountswitcher-passwordinput" placeholder="Password"><br><input type="password" id="as-pw2" placeholder="Repeat password">`, ()=>{
                                    let pw1 = document.getElementById("accountswitcher-passwordinput").value;
                                    let pw2 = document.getElementById("as-pw2").value;
                                    if(pw1 != pw2){
                                        Toasts.show("Passwords don't match", {type: Toasts.ToastTypes.error});
                                        return retry();
                                    }
                                    passwd = pw1;
                                    this.settings.encrypted = true;
                                    this.settings.encTest = this.encrypt("test", passwd);
                                    this.settings.accounts.forEach(acc => acc.token = this.encrypt(acc.token, passwd));
                                    this.saveSettings();
                                }, ()=>{/*cancelled*/})
                            }
                            retry();
                        }else{
                            this.requirePassword().then(r => {
                                this.settings.encrypted = false;
                                this.settings.encTest = "test";
                                this.settings.accounts.forEach(acc => acc.token = this.decrypt(acc.token, passwd));
                                passwd = null;
                                this.saveSettings();
                            }, rejected => {
                                this.alertText("Delete accounts?", `If you forgot your password please type "YES" in the textbox below. Then all your saved accounts will be deleted. If you don't type YES in the box encryption will stay enabled.<br><input id="accountswitcher-passwordinput" placeholder="Type YES to remove encryption">`, ()=>{
                                    let v = document.getElementById("accountswitcher-passwordinput").value;
                                    if(v == "YES"){
                                        this.settings.encrypted = false;
                                        this.settings.accounts = [];
                                        this.settings.encTest = "test";
                                        this.saveSettings();
                                    }
                                }, ()=>{})
                            })
                        }
                    })
                )
                .append(accountsField)
                .append(addAccountButton);
        this.settings.accounts.forEach(acc => addAccount(acc));
        return panel;
    }

    loadSettings(){
        this.settings = ZLibrary.PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
        if(!Array.isArray(this.settings.accounts)) this.settings.accounts = Object.values(this.settings.accounts);
        this.settings.accounts.forEach(acc => {
            if(!Array.isArray(acc.keybind)) acc.keybind = Object.values(acc.keybind);
        });
    }
    saveSettings(){
        ZLibrary.PluginUtilities.saveSettings(this.getName(), this.settings);
    }

    async convertOldStyleSettings(oldSettings){
        let { language, encTest, encrypted, showChangelog } = oldSettings;
        this.requireOldPassword(encTest, encrypted).then(oldPw => {
            let s = {
                language,
                accounts: [],
                encrypted: encrypted && oldPw != undefined,
                showChangelog,
                lastUsedVersion: this.getVersion(),
                encTest: oldPw == null || oldPw == undefined ? "test" : this.encrypt("test", oldPw)
            };
            if(oldPw !== undefined){
                for(let i = 1; i < 11; i++){
                    if(oldSettings["id"+i] == "") continue;
                    let dec = (val)=>{
                        if(typeof val != "string") return val;
                        if(val == "") return val;
                        let os = require("os");
                        let pw = os.platform() + os.type() + "nFagrAetGcHetaFEOvM".charAt(i).repeat(9*i%11);
                        try{
                            return CryptoJS.AES.decrypt(val, pw).toString(CryptoJS.enc.Utf8) || val;
                        }catch(ex){
                            console.error(ex);
                            return val;
                        }
                    }
                    let t = dec(oldSettings["token"+i]);
                    if(encrypted) t = CryptoJS.AES.decrypt(t, oldPw).toString(CryptoJS.enc.Utf8);
                    let uId = dec(oldSettings["id"+i]);
                    t = this.encrypt(t, uId);
                    if(encrypted) t = this.encrypt(t, oldPw);
                    s.accounts.push({
                        name: dec(oldSettings["name"+i]),
                        id: uId,
                        avatar: dec(oldSettings["avatar"+i]),
                        keybind: [64, 9+i],
                        token: t
                    })
                }
            }
            this.settings = s;
            this.saveSettings();
            this.settings.accounts.forEach(a => this.registerKeybind(a));
            this.alertText("Settings updated", `The plugin's settings now got converted to the new style.`);
        })
    }
}
