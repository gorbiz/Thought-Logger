# PS. This one was better in some ways: https://github.com/gorbiz/thought-logger-original

# dev tools
`Ctrl`+`Shift`+`I`

# start script example

`~/bin/thought-logger`:
```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
cd ~/code/logger/thought-app/ || exit
npm start >> /tmp/thought-logger.log 2>&1
```

`~/.local/share/applications/thought-logger.desktop`:
```
[Desktop Entry]
Type=Application
Name=thought-logger
Exec=/home/gorbiz/bin/thought-logger
Icon=/home/gorbiz/code/logger/thought-app/icon.png
Terminal=false
Categories=Utility;
```

# i3 window manager config
```sh
echo 'for_window [title="^thought-logger$"] floating enable' >> ~/.config/i3/config
```
