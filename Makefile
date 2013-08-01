all:
	zip -j "nozapret.xpi" "firefox/bootstrap.js" "firefox/install.rdf"
	chromium --pack-extension=chrome --pack-extension-key=nozapret.pem
