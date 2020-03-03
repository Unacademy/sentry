import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

import {t, tct} from 'app/locale';
import Form from 'app/views/settings/components/forms/form';
import {Panel, PanelAlert, PanelBody, PanelHeader} from 'app/components/panels';
import RangeField from 'app/views/settings/components/forms/rangeField';
import SettingsPageHeader from 'app/views/settings/components/settingsPageHeader';
import space from 'app/styles/space';

const getRateLimitValues = () => {
  const steps = [];
  let i = 0;
  while (i <= 1000000) {
    steps.push(i);
    if (i < 10000) {
      i += 1000;
    } else if (i < 100000) {
      i += 10000;
    } else {
      i += 100000;
    }
  }
  return steps;
};

// We can just generate this once
const ACCOUNT_RATE_LIMIT_VALUES = getRateLimitValues();

export default class OrganizationRateLimit extends React.Component {
  static propTypes = {
    organization: PropTypes.object.isRequired,
  };

  handleSubmitSucces = () => {
    // TODO(billy): Update organization.quota in organizationStore with new values
  };

  render() {
    const {organization} = this.props;
    const {quota} = organization;
    const {projectLimit, accountLimit} = quota;
    const initialData = {
      projectRateLimit: projectLimit || 100,
      accountRateLimit: accountLimit,
    };

    return (
      <div>
        <SettingsPageHeader title={t('Rate Limits')} />

        <Panel>
          <PanelHeader disablePadding>
            <Box>{t('Adjust Limits')}</Box>
          </PanelHeader>
          <PanelBody>
            <PanelAlert type="info">
              {t(`Rate limits allow you to control how much data is stored for this
                organization. When a rate is exceeded the system will begin discarding
                data until the next interval.`)}
            </PanelAlert>

            <Form
              data-test-id="rate-limit-editor"
              saveOnBlur
              allowUndo
              apiMethod="PUT"
              apiEndpoint={`/organizations/${organization.slug}/`}
              initialData={initialData}
            >
              <RangeField
                name="accountRateLimit"
                label={t('Account Limit')}
                min={0}
                max={1000000}
                allowedValues={ACCOUNT_RATE_LIMIT_VALUES}
                help={t(
                  'The maximum number of events to accept across this entire organization.'
                )}
                placeholder={t('e.g. 500')}
                formatLabel={value =>
                  !value
                    ? t('No Limit')
                    : tct('[number] per hour', {
                        number: value.toLocaleString(),
                      })
                }
              />
              <RangeField
                name="projectRateLimit"
                label={t('Per-Project Limit')}
                help={t(
                  'The maximum percentage of the account limit (set above) that an individual project can consume.'
                )}
                step={5}
                min={50}
                max={100}
                formatLabel={value =>
                  value !== 100 ? (
                    `${value}%`
                  ) : (
                    <span
                      dangerouslySetInnerHTML={{__html: `${t('No Limit')} &mdash; 100%`}}
                    />
                  )
                }
              />
            </Form>
          </PanelBody>
        </Panel>
      </div>
    );
  }
}

const Box = styled('div')`
  display: flex;
  flex: 1;
  padding: 0 ${space(2)};
`;
