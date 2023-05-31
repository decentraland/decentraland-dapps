import React, { useCallback, useEffect, useMemo, useState } from 'react'
import uuid from 'uuid'
import { Network } from '@dcl/schemas'
import {
  AuthorizationStep,
  AuthorizationModal as BaseAuthorizationModal
} from 'decentraland-ui'
import { getAnalytics } from '../../../modules/analytics/utils'
import {
  AuthorizationStepAction,
  AuthorizationStepStatus,
  Props
} from './AuthorizationModal.types'
import {
  getPriceInMana,
  getStepMessage,
  getSteps,
  getTranslation
} from './utils'

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
  targetContractLabel,
  translationKeys,
  onClose,
  onRevoke,
  onGrant,
  onAuthorized,
  onFetchAuthorizations
}: Props) {
  const analytics = getAnalytics()
  const [analyticsTraceId] = useState(uuid())
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState<AuthorizationStepAction>()
  const [shouldReauthorize, setShouldReauthorize] = useState(false)

  const requiredAllowanceAsEth = getPriceInMana(requiredAllowance)

  useEffect(() => {
    analytics.track('[Authorization Flow] Modal Opened', {
      action,
      requiredAllowance,
      traceId: analyticsTraceId
    })
  }, [])

  useEffect(() => {
    onFetchAuthorizations()
  }, [onFetchAuthorizations])

  const handleRevokeToken = useCallback(() => {
    onRevoke(analyticsTraceId)
    analytics.track('[Authorization Flow] Authorize Revoke Click', {
      action,
      traceId: analyticsTraceId
    })
    setLoading(AuthorizationStepAction.REVOKE)
  }, [onRevoke])

  const handleGrantToken = useCallback(() => {
    onGrant(analyticsTraceId)
    analytics.track('[Authorization Flow] Authorize Grant Click', {
      action,
      traceId: analyticsTraceId
    })
    setLoading(AuthorizationStepAction.GRANT)
  }, [onGrant])

  const handleAuthorized = useCallback(() => {
    onAuthorized()
    analytics.track('[Authorization Flow] Confirm Transaction Click', {
      action,
      traceId: analyticsTraceId
    })
    setLoading(AuthorizationStepAction.CONFIRM)
  }, [onAuthorized])

  const steps = useMemo(() => {
    const authSteps = getSteps({
      authorizationType,
      network,
      requiredAllowance,
      currentAllowance,
      authorization,
      authorizedContractLabel,
      translationKeys,
      targetContractLabel
    })
    return [
      ...authSteps,
      {
        title: getTranslation(translationKeys, 'confirm_transaction.title', {
          action: getTranslation(translationKeys, 'action')
        }),
        action: getTranslation(translationKeys, 'confirm_transaction.action'),
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
              error: getTranslation(
                translationKeys,
                'insufficient_amount_error.message',
                {
                  price: requiredAllowanceAsEth
                }
              ),
              action: 'Revoke',
              status: revokeStatus,
              message: !LOADING_STATUS.includes(revokeStatus) ? (
                <div className="authorization-error">
                  {getTranslation(
                    translationKeys,
                    'insufficient_amount_error.message',
                    { price: requiredAllowanceAsEth }
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
                : getTranslation(translationKeys, 'set_cap.action'),
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
                : getTranslation(translationKeys, 'revoke_cap.action'),
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
              : getStepMessage(
                  index,
                  step.status,
                  step.error,
                  currentStep,
                  requiredAllowanceAsEth,
                  step.actionType,
                  translationKeys
                ),
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
      header={getTranslation(translationKeys, 'title', {
        action: getTranslation(translationKeys, 'title_action')
      })}
    />
  )
}
