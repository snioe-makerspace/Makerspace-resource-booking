# https://nixos-and-flakes.thiscute.world/development/intro
# https://dnedic.github.io/blog/nix-shell-embedded-development-environment/
{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs, ... }:
    let
      system = "x86_64-linux";
    in
    {
      packages."${system}".default =
        let
          pkgs = import nixpkgs { inherit system; };
        in
        pkgs.mkShell {
          packages = with pkgs; [
            nodePackages.prisma
          ];

          shellHook = with pkgs; ''
            export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/migration-engine"
            export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
            export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
            export PRISMA_INTROSPECTION_ENGINE_BINARY="${prisma-engines}/bin/introspection-engine"
            export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
            export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING="1";
          '';
        };
    };
}
# {
#   packages.x86_64-linux.nodePackages.prisma = nixpkgs.legacyPackages.x86_64-linux.nodePackages.prisma;
#   packages.x86_64-linux.default = self.packages.x86_64-linux.nodePackages.prisma;
# };

