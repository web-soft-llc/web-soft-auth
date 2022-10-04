# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased] -->

## [1.2.0] - 2022-10-04

### Added

- TwoFactorAuth class and module.
- MessageService class.
- Documentation in russian.

### Changed

- Password now checking for minimum and maximum length when created.
- Password now checking against top 1000 most popular password when created.
- User's account now can be locked for a wile after several faild login attempts.

## [1.0.1] - 2022-09-20

### Changed

- Fix types definitions in index.d.ts file.
- Fix filename in main filed in package.json file.

## [1.0.0] - 2022-09-19

### Added

- Simple Authentication module for web-soft-server with password authentication.
- Security class for password encoding and decoding.
- Schema and types for Authentication module.

[unreleased]: https://github.com/web-soft-llc/web-soft-server/compare/v1.2.0...master
[1.2.0]: https://github.com/web-soft-llc/web-soft-server/releases/tag/v1.0.1...v1.2.0
[1.0.1]: https://github.com/web-soft-llc/web-soft-server/releases/tag/v1.0.0...v1.0.1
[1.0.0]: https://github.com/web-soft-llc/web-soft-server/releases/tag/v1.0.0
