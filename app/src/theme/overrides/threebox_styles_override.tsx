import { css } from 'styled-components'

import { ButtonCSS } from '../../components/button/button_styling_types'

const MAIN_AVATAR_DIMENSIONS = '40px'
const COMMENT_AVATAR_DIMENSIONS = '32px'
const INPUT_FORM_HEIGHT = '54px'

export const ThreeboxStylesOverride = css`
  .threeBoxCustom > .threebox-comments-react {
    max-width: 100%;
    padding: 0;

    /* Main comment area */
    .input {
      img {
        height: ${MAIN_AVATAR_DIMENSIONS};
        left: 8px;
        max-height: ${MAIN_AVATAR_DIMENSIONS};
        max-width: ${MAIN_AVATAR_DIMENSIONS};
        min-height: ${MAIN_AVATAR_DIMENSIONS};
        min-width: ${MAIN_AVATAR_DIMENSIONS};
        width: ${MAIN_AVATAR_DIMENSIONS};
      }

      .input_form {
        color: ${props => props.theme.colors.textColor};
        font-size: 13px;
        font-weight: normal;
        height: ${INPUT_FORM_HEIGHT};
        line-height: 1.2;
        margin: 0;
        max-width: 100%;
        min-height: ${INPUT_FORM_HEIGHT};
        min-width: 100%;
        padding: 5px 50px 5px 60px;

        &:empty {
          height: ${INPUT_FORM_HEIGHT}!important;
        }
      }

      .input_emptyUser {
        max-height: 100%;
        min-height: 44px;
        min-width: 44px;
      }

      .input_login,
      .input_postLoading_text {
        display: none;
      }

      .input_commentAs {
        color: ${props => props.theme.colors.textColorLight};
        left: auto;
        margin: 0;
        right: 0;
        top: -40px;
      }

      .sc-user-input--picker-wrapper {
        max-height: 100%;
        min-height: ${INPUT_FORM_HEIGHT};
        min-width: 44px;
        top: 0;
      }
    }

    /* Comments list */
    .dialogue {
      .dialogue_grid {
        display: block;
        margin-bottom: 0;
        row-gap: 30px;
      }

      /* Comment */
      .comment {
        border-bottom: 1px solid ${props => props.theme.borders.borderColor};
        padding: 15px 8px;

        &:first-child {
          border-top: 1px solid ${props => props.theme.borders.borderColor};
        }

        img {
          height: ${COMMENT_AVATAR_DIMENSIONS};
          max-height: ${COMMENT_AVATAR_DIMENSIONS};
          max-width: ${COMMENT_AVATAR_DIMENSIONS};
          min-height: ${COMMENT_AVATAR_DIMENSIONS};
          min-width: ${COMMENT_AVATAR_DIMENSIONS};
          width: ${COMMENT_AVATAR_DIMENSIONS};
        }

        .comment_content_context_main_user_info {
          margin-bottom: 0;
        }

        .comment_content_context_main_user_info_username {
          color: #000;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.2;
        }

        .comment_content_context_main_user_info_address {
          color: ${props => props.theme.colors.textColorLight};
          font-size: 13px;
          font-weight: normal;
          line-height: 1.2;

          &::before {
            content: '(';
          }

          &::after {
            content: ')';
          }
        }

        .comment_content_context {
          margin: 0;
        }

        .comment_content_context_time {
          color: ${props => props.theme.colors.textColorLight};
          font-size: 11px;
          font-weight: normal;
          line-height: 1.36;
        }

        .comment_content_text {
          color: #000;
          font-size: 13px;
          font-weight: normal;
          line-height: 1.33;
          margin: 2px 0 0 0;
        }
      }
    }

    .context {
      height: auto;
      justify-content: flex-end;
      margin: 0 0 15px;
      min-width: 0;

      .context_text {
        color: ${props => props.theme.colors.textColorLight};
        font-size: 12px;
        font-weight: 400;
        line-height: 1.2;
      }
    }

    .dialogue_button_container {
      height: auto;

      .dialogue_button {
        ${ButtonCSS}
        width: 100%;
      }
    }
  }

  footer {
    margin-bottom: 0;
    overflow: hidden;
    padding-top: 20px;

    .footer_text {
      color: ${props => props.theme.colors.textColorLight};
      font-size: 12px;
      font-weight: 400;
      display: inline-block;
      text-align: center;
    }
  }
`
