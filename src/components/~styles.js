import { css } from "lit-element"

export const fontStyles = css`
  .ffl {
    font-family: "Lato", sans-serif;
  }

  .ffr {
    font-family: "Roboto", sans-serif;
  }

  .fnw {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fh1 {
    font-weight: 300;
    font-size: 6rem;
    letter-spacing: -0.09375rem;
    text-transform: capitalize;
    -webkit-font-smoothing: antialiased;
  }

  .fh2 {
    font-weight: 300;
    font-size: 3.75rem;
    letter-spacing: -0.03125rem;
    text-transform: capitalize;
    -webkit-font-smoothing: antialiased;
  }

  .fh3 {
    font-weight: 400;
    font-size: 3rem;
    letter-spacing: 0rem;
    text-transform: capitalize;
    -webkit-font-smoothing: antialiased;
  }

  .fh4 {
    font-weight: 400;
    font-size: 2.125rem;
    letter-spacing: 0.015625rem;
    text-transform: capitalize;
    -webkit-font-smoothing: antialiased;
  }

  .fh5 {
    font-weight: 400;
    font-size: 1.5rem;
    letter-spacing: 0rem;
    text-transform: capitalize;
    -webkit-font-smoothing: antialiased;
  }

  .fh6 {
    font-weight: 500;
    font-size: 1.25rem;
    letter-spacing: 0.009375rem;
    text-transform: capitalize;
    -webkit-font-smoothing: antialiased;
  }

  .ft {
    font-weight: 400;
    font-size: 1rem;
    letter-spacing: 0.009375rem;
    text-transform: capitalize;
    -webkit-font-smoothing: antialiased;
  }

  .fst {
    font-weight: 500;
    font-size: 0.875rem;
    letter-spacing: 0.00625rem;
    text-transform: capitalize;
    -webkit-font-smoothing: antialiased;
  }

  .fbd1 {
    font-weight: 400;
    font-size: 1rem;
    letter-spacing: 0.03125rem;
    -webkit-font-smoothing: antialiased;
  }

  .fbd2 {
    font-weight: 400;
    font-size: 0.875rem;
    letter-spacing: 0.015625rem;
    -webkit-font-smoothing: antialiased;
  }

  .fbt {
    font-weight: 500;
    font-size: 0.875rem;
    letter-spacing: 0.046875rem;
    text-transform: uppercase;
    -webkit-font-smoothing: antialiased;
  }

  .fc {
    font-weight: 400;
    font-size: 0.75rem;
    letter-spacing: 0.025rem;
    text-transform: capitalize;
    -webkit-font-smoothing: antialiased;
  }
`

export const shadowStyles = css`
  .z2 {
    box-shadow:
      0 3px 1px -2px rgba(0,0,0,.2),
      0 2px 2px 0 rgba(0,0,0,.14),
      0 1px 5px 0 rgba(0,0,0,.12)
  }

  .z4 {
    box-shadow:
      0 2px 4px -1px rgba(0,0,0,.2),
      0 4px 5px 0 rgba(0,0,0,.14),
      0 1px 10px 0 rgba(0,0,0,.12)
  }

  .z6 {
    box-shadow:
      0 3px 5px -1px rgba(0,0,0,.2),
      0 6px 10px 0 rgba(0,0,0,.14),
      0 1px 18px 0 rgba(0,0,0,.12)
  }

  .z8 {
    box-shadow:
      0 5px 5px -3px rgba(0,0,0,.2),
      0 8px 10px 1px rgba(0,0,0,.14),
      0 3px 14px 2px rgba(0,0,0,.12)
  }
`