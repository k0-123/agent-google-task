'use client'

import React from 'react'

interface OverSummaryCardProps {
  overNumber?: number
  runs?: number
  commentary?: string
}

export function OverSummaryCard({ overNumber = 14, commentary }: OverSummaryCardProps) {
  const displayOver = overNumber === 0 ? 14 : overNumber

  return (
    <>
      <div className="sec-head reveal-fast in">
        <span className="sec-num">02</span>
        <span className="sec-line"></span>
        <span className="sec-title">AI Commentary</span>
      </div>
      <div className="commentary-wrap reveal in">
        <div className="commentary-card">
          <div className="commentary-header">
            <span className="commentary-over">Over {displayOver} recap</span>
            <span className="gemini-tag">Gemini AI</span>
          </div>
          <div className="commentary-body">
            <p className="commentary-text">
              {commentary ? (
                <span>{commentary}</span>
              ) : (
                <span>
                  <strong>Bumrah was unplayable</strong> — three consecutive dots, a wide, then Kohli&apos;s wicket for 67. Wankhede went silent. MI need 34 from 33 to clinch their record sixth IPL title tonight.
                </span>
              )}
            </p>
          </div>
          <div className="commentary-footer">
            <div className="c-stat">
              <span className="c-stat-val">4</span>
              <span className="c-stat-key">Runs</span>
            </div>
            <div className="c-stat">
              <span className="c-stat-val red">1</span>
              <span className="c-stat-key">Wicket</span>
            </div>
            <div className="c-stat">
              <span className="c-stat-val">3</span>
              <span className="c-stat-key">Dots</span>
            </div>
            <div className="c-stat">
              <span className="c-stat-val gold">4.0</span>
              <span className="c-stat-key">Economy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
