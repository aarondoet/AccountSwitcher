//META{"name":"AccountSwitcher","displayName":"AccountSwitcher","website":"https://twitter.com/l0c4lh057/","source":"https://github.com/l0c4lh057/GuildData/blob/master/GuildData.plugin.js"}*//

class AccountSwitcher {
	getName(){return "AccountSwitcher";}
	getAuthor(){return "l0c4lh057";}
	getVersion(){return "0.0.4";}
	getDescription(){return "Switch between multiple accounts with AltLeft+1 up to AltLeft+0";}
	
	
	get defaultSettings(){
		return {
			token1: "",
			token2: "",
			token3: "",
			token4: "",
			token5: "",
			token6: "",
			token7: "",
			token8: "",
			token9: "",
			token10: ""
		}
	}
	
	
	start(){
		let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
        };
		let lib = document.getElementById("NeatoBurritoLibrary");
		if(!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
	}
	onLibLoaded(){
		NeatoLib.Updates.check(this, "https://raw.githubusercontent.com/l0c4lh057/AccountSwitcher/master/AccountSwitcher.plugin.js");
		this.AccountManager = NeatoLib.Modules.get(["loginToken"]);
		this.UserInfoStore = NeatoLib.Modules.get(["getToken"]);
		this.settings = NeatoLib.Settings.load(this, this.defaultSettings);
		this.registerKeybinds();
	}
	stop(){
		this.unregisterKeybinds();
	}
	
	saveSettings() {
		NeatoLib.Settings.save(this);
	}
	
	
	
	unregisterKeybinds() {
		for(let i = 1; i < 11; i++){
			NeatoLib.Keybinds.detachListener("accountswitcher-keybind-" + i);
		}
	}

	registerKeybinds() {
		for(let i = 1; i < 11; i++){
			let keybind = {
				primaryKey : "Digit" + (i % 10),
				modifiers : ["AltLeft"]
			};
			NeatoLib.Keybinds.attachListener("accountswitcher-keybind-" + i, keybind, () => {
				let token = this.settings["token" + i];
				if(token.length > 10){
					this.AccountManager.loginToken(this.settings["token" + i]);
					location.reload();
				}else{
					NeatoLib.showToast("Token " + i + " is not valid", "error");
				}
			});
		}
	}
	
	
	
	getSettingsPanel() {
		setTimeout(() => {
			for(let i = 1; i < 11; i++){
				NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Token " + i, this.settings["token" + i], e => {
					this.settings["token" + i] = e.target.value;
					this.saveSettings();
				}), this.getName());
			}
			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createButton("Copy token of current account", e => {
				let tempInput = document.createElement("input");
				document.body.appendChild(tempInput);
				tempInput.setAttribute('value', this.UserInfoStore.getToken())
				tempInput.select();
				document.execCommand('copy');
				document.body.removeChild(tempInput);
				NeatoLib.showToast("Token copied", "success");
			}), this.getName());
		}, 0);

		return this.pluginNameLabel(this.getName());
	}
	
	pluginNameLabel(name) {
		return `
			<style>
				#bd-settingspane-container *::-webkit-scrollbar {
					max-width: 10px;
				}

				#bd-settingspane-container *::-webkit-scrollbar-track-piece {
					background: transparent;
					border: none;
					border-radius: 5px;
				}

				#bd-settingspane-container *:hover::-webkit-scrollbar-track-piece {
					background: #2F3136;
					border-radius: 5px;
				}

				#bd-settingspane-container *::-webkit-scrollbar-thumb {
					background: #1E2124;
					border: none;
					border-radius: 5px;
				}

				#bd-settingspane-container *::-webkit-scrollbar-button {
					display: none;
				}
			</style>
			<h style="color: white;font-size: 30px;font-weight: bold;">${name.replace(/([A-Z])/g, ' $1').trim()} by l0c4lh057</h>`;
	}
}
