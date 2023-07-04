{ pkgs }: {
	deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.ffmpeg
    pkgs.libuuid
    pkgs.libwebp
    pkgs.git
    pkgs.replitPackages.jest
	];
  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.libuuid
    ];
  };
}