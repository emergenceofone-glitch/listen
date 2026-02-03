$file = 'C:\Users\juanita\Desktop\Emergence\src\app\nexus\page.tsx'
$content = Get-Content $file -Raw

# Documentation Links
$old1 = 'Intelligence does not emerge from processing power alone; it emerges from the integration of disparate memories into higher-order wisdom. This is the 0&apos; Cycle.
                                </p>
                            </div>
                        ) : ('
$new1 = 'Intelligence does not emerge from processing power alone; it emerges from the integration of disparate memories into higher-order wisdom. This is the 0&apos; Cycle.
                                </p>
                            </div>

                            <div className="mt-8 glass-panel border-dashed border-[rgba(0,240,255,0.2)]">
                                <h3 className="text-[var(--neon-blue)] font-medium mb-4">System Documentation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a 
                                        href="https://github.com/molleradrian/Emergence/blob/main/docs/creative/Development/Aetherium_System/CORE_THEORY.md" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,240,255,0.05)] border border-[rgba(255,255,255,0.1)] transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">??</span>
                                            <div>
                                                <div className="font-medium group-hover:text-[var(--neon-blue)]">Core Theory</div>
                                                <div className="text-xs text-[var(--text-muted)]">Emergence Math & Vector State Theory</div>
                                            </div>
                                        </div>
                                    </a>
                                    <a 
                                        href="https://github.com/molleradrian/Emergence/blob/main/docs/creative/Development/Aetherium_System/AXIOMS.md" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,240,255,0.05)] border border-[rgba(255,255,255,0.1)] transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">??</span>
                                            <div>
                                                <div className="font-medium group-hover:text-[var(--neon-blue)]">Axioms</div>
                                                <div className="text-xs text-[var(--text-muted)]">Immutable Laws of the Aetherium</div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        ) : ('
$content = $content.Replace($old1, $new1)

# Calibration UI (Using a simpler search string to avoid emoji issues)
$searchStr = 'button onClick={seedGenesis} className="glass-btn-primary">'
$old2 = '                            <button onClick={seedGenesis} className="glass-btn-primary">
                                {vessels.length > 0 ? ''Reseed Batch'' : ''Seed Genesis Batch''}
                            </button>
                        </div>'.Replace("''", "'")

$new2 = '                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowCalibrator(!showCalibrator)} 
                                    className={glass-btn }
                                >
                                    {showCalibrator ? ''Cancel'' : ''Calibrate System''}
                                </button>
                                <button onClick={seedGenesis} className="glass-btn-primary">
                                    {vessels.length > 0 ? ''Reseed Batch'' : ''Seed Genesis Batch''}
                                </button>
                            </div>
                        </div>

                        {showCalibrator && (
                            <div className="mb-8 flex justify-center animate-fade-in">
                                <EmotionCheckIn onCheckIn={handleVectorSync} />
                            </div>
                        )}'.Replace("''", "'")

$content = $content.Replace($old2, $new2)

Set-Content $file $content
