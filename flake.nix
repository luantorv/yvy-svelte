{
  description = "YVY-svelte – SvelteKit + Ollama + RAG";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            ollama
          ];

          shellHook = ''
            echo ""
            echo "  YVY-svelte dev shell"
            echo ""
            echo "  1. En otra terminal:  ollama serve"
            echo "  2. Primera vez:       ollama pull phi3:latest"
            echo "                        ollama pull nomic-embed-text"
            echo "  3.                    npm install && npm run dev"
            echo ""
          '';
        };
      }
    );
}
