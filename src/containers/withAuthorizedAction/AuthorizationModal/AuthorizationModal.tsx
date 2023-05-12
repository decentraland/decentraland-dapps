import React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Network } from '@dcl/schemas'
import {
  AuthorizationStep,
  AuthorizationModal as BaseAuthorizationModal
} from 'decentraland-ui'
import { t } from '../../../modules/translation/utils'
import {
  AuthorizationStepAction,
  AuthorizationStepStatus,
  Props
} from './AuthorizationModal.types'
import { getStepMessage, getSteps } from './utils'

const LOADING_STATUS = [
  AuthorizationStepStatus.LOADING_INFO,
  AuthorizationStepStatus.PROCESSING,
  AuthorizationStepStatus.WAITING
]

export function AuthorizationModal({
  authorization,
  requiredAllowance,
  currentAllowance,
  action,
  authorizationType,
  revokeStatus,
  grantStatus,
  confirmationStatus,
  error,
  confirmationError,
  network,
  authorizedContractLabel,
  onClose,
  onRevoke,
  onGrant,
  onAuthorized,
  onFetchAuthorizations
}: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState<AuthorizationStepAction>()
  const [shouldReauthorize, setShouldReauthorize] = useState(false)

  useEffect(() => {
    onFetchAuthorizations()
  }, [onFetchAuthorizations])

  const handleRevokeToken = useCallback(() => {
    onRevoke()
    setLoading(AuthorizationStepAction.REVOKE)
  }, [onRevoke])

  const handleGrantToken = useCallback(() => {
    onGrant()
    setLoading(AuthorizationStepAction.GRANT)
  }, [onGrant])

  const handleAuthorized = useCallback(() => {
    onAuthorized()
    setLoading(AuthorizationStepAction.CONFIRM)
  }, [onAuthorized])

  const steps = useMemo(() => {
    const authSteps = getSteps({
      authorizationType,
      network,
      requiredAllowance,
      currentAllowance,
      authorization,
      authorizedContractLabel
    })
    return [
      ...authSteps,
      {
        title: t('@dapps.authorization_modal.confirm_transaction.title', {
          action: t(`@dapps.authorization_modal.${action}.action`)
        }),
        action: t('@dapps.authorization_modal.confirm_transaction.action'),
        status: confirmationStatus,
        actionType: AuthorizationStepAction.CONFIRM,
        error: confirmationError,
        onActionClick: handleAuthorized
      }
    ]
      .map(step => {
        if (step.actionType === AuthorizationStepAction.GRANT) {
          if (
            shouldReauthorize ||
            (grantStatus === AuthorizationStepStatus.ALLOWANCE_AMOUNT_ERROR &&
              network === Network.ETHEREUM)
          ) {
            return {
              ...step,
              error: t(
                '@dapps.authorization_modal.insufficient_amount_error.message'
              ),
              action: 'Revoke',
              status: revokeStatus,
              message:
                revokeStatus === AuthorizationStepStatus.PENDING ||
                revokeStatus === AuthorizationStepStatus.DONE ? (
                  <div className="authorization-error">
                    {t(
                      '@dapps.authorization_modal.insufficient_amount_error.message'
                    )}
                  </div>
                ) : (
                  undefined
                ),
              actionType: AuthorizationStepAction.REVOKE,
              testId: 'reauthorize-step',
              onActionClick: handleRevokeToken
            }
          }
          return {
            ...step,
            action:
              grantStatus === AuthorizationStepStatus.DONE
                ? undefined
                : t('@dapps.authorization_modal.set_cap.action'),
            error,
            status: grantStatus,
            onActionClick: handleGrantToken
          }
        }

        if (step.actionType === AuthorizationStepAction.REVOKE) {
          return {
            ...step,
            action:
              revokeStatus === AuthorizationStepStatus.DONE
                ? undefined
                : t('@dapps.authorization_modal.revoke_cap.action'),
            error,
            status: revokeStatus,
            onActionClick: handleRevokeToken
          }
        }

        return step as AuthorizationStep & { error: string; testId: string }
      })
      .map((step, index) => {
        return {
          ...step,
          isLoading:
            index === currentStep && LOADING_STATUS.includes(step.status),
          message:
            'message' in step && step.message
              ? step.message
              : getStepMessage(index, step.status, step.error, currentStep),
          testId: 'testId' in step ? step.testId : `${step.actionType}-step`
        }
      })
  }, [
    grantStatus,
    revokeStatus,
    authorizationType,
    requiredAllowance,
    currentAllowance,
    network,
    action,
    confirmationStatus,
    confirmationError,
    authorizedContractLabel,
    shouldReauthorize,
    currentStep,
    error,
    handleGrantToken,
    handleRevokeToken,
    handleAuthorized
  ])

  useEffect(() => {
    const currentStepData = steps[currentStep]

    if (
      currentStepData.status === AuthorizationStepStatus.DONE &&
      currentStepData.actionType === loading
    ) {
      if (shouldReauthorize) {
        setShouldReauthorize(false)
      } else {
        setCurrentStep(currentStep + 1)
        setLoading(undefined)
      }
    }
    // We only want to run this when there is a change in the current steps status
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps[currentStep].status])

  useEffect(() => {
    if (
      grantStatus === AuthorizationStepStatus.ALLOWANCE_AMOUNT_ERROR &&
      network === Network.ETHEREUM
    ) {
      setShouldReauthorize(true)
    }
  }, [grantStatus, network, setShouldReauthorize])

  return (
    <BaseAuthorizationModal
      onClose={onClose}
      currentStep={currentStep}
      steps={steps}
      header={t('@dapps.authorization_modal.title', {
        action: t(`@dapps.authorization_modal.${action}.title_action`)
      })}
    />
  )
}
