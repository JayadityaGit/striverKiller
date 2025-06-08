import type React from "react"
import { useEffect, useState } from "react"
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"
import type { User } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

import SearchInput from "./components/SearchInput"
import DifficultyFilter from "./components/DifficultyFilter"
import gokuImage from "./photos/goku.jpg"
import { auth, db, provider } from "./firebase"

// Problem and Step types
type Problem = {
  title: string
  url?: string
  practice?: string
  revision?: string
  difficulty?: string
  solve?: string // Added solve field
  resource?: string // Added resource field
  note?: string // Added note field
}

type Step = {
  title: string
  problems: Problem[]
}

const Index: React.FC = () => {
  const [data, setData] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [allCollapsed, setAllCollapsed] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<{ [key: number]: boolean }>({})
  const [showStats, setShowStats] = useState(false)

  // Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u) {
        setShowStats(true)
      } else {
        setShowStats(false)
        setChecked({})
      }
    })
    return () => unsub()
  }, [])

  // Fetch problems data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/src/data/data.json")
        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError("Failed to load problems data. Please try again.")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Load checked problems from Firestore
  useEffect(() => {
    if (!user) return

    const fetchChecked = async () => {
      try {
        const ref = doc(db, "users", user.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setChecked(snap.data().checked || {})
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
      }
    }

    fetchChecked()
  }, [user])

  // Handle checkbox change
  const handleCheck = async (problemKey: string, value: boolean) => {
    if (!user) return

    try {
      const newChecked = { ...checked, [problemKey]: value }
      setChecked(newChecked)
      await setDoc(doc(db, "users", user.uid), { checked: newChecked }, { merge: true })
    } catch (err) {
      console.error("Error updating user data:", err)
    }
  }

  const getProblemKey = (stepIdx: number, probIdx: number) => `${stepIdx}_${probIdx}`

  const filterProblems = (problems: Problem[]) => {
    return problems.filter((problem) => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty
      return matchesSearch && matchesDifficulty
    })
  }

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error("Sign in error:", err)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  // Collapse functionality
  const toggleAllSections = () => {
    const newCollapsedState = !allCollapsed
    setAllCollapsed(newCollapsedState)

    const newCollapsedSections: { [key: number]: boolean } = {}
    data.forEach((_, index) => {
      newCollapsedSections[index] = newCollapsedState
    })
    setCollapsedSections(newCollapsedSections)
  }

  const toggleSection = (index: number) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Calculate stats
  const totalProblems = data.reduce((acc, step) => acc + step.problems.length, 0)
  const completedProblems = Object.values(checked).filter(Boolean).length
  const completionRate = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat transform scale-110 blur-sm opacity-40"
          style={{ backgroundImage: `url(${gokuImage})` }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-black/95 via-gray-900/80 to-black/95" />
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4 animate-bounce text-white">⚡</div>
            <div className="text-4xl font-bold mb-4 text-white animate-pulse">LOADING...</div>
            <div className="text-lg text-gray-400 mb-8">Preparing your coding journey</div>
          </div>
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-gray-400 border-b-transparent rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            />
          </div>
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-3 h-3 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-gray-900">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${gokuImage})` }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900/90 to-black/95" />
        <div className="relative z-10 text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">💥</div>
          <h2 className="text-3xl font-bold text-white mb-4">Error Loading Data</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
          >
            RETRY
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gray-900">
      {/* Enhanced Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transform scale-110 opacity-30"
        style={{ backgroundImage: `url(${gokuImage})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/95 via-gray-900/70 to-black/95" />
      <div className="fixed inset-0 bg-gradient-to-r from-gray-900/50 via-transparent to-gray-900/50" />

      {/* Animated particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Enhanced Header */}
        <header className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-wider">GOONIE TRACKER</h1>
 
            </div>

          </div>

          {/* Enhanced Auth Section */}
          <div className="flex justify-center mb-8">
            {!user ? (
              <button
                onClick={handleSignIn}
                className="group relative px-10 py-4 bg-white text-black font-bold rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/25"
              >
                <div className="absolute inset-0 bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 text-lg">SIGN IN</span>
              </button>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-4 rounded-lg flex items-center gap-6 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-black font-bold text-lg">{user.displayName?.charAt(0) || "U"}</span>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Welcome, {user.displayName || "User"}</div>
                    <div className="text-gray-400 text-sm">Signed In</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Stats Section */}
          {showStats && user && (
            <div className="mb-8 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Total Problems */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Problems</p>
                      <p className="text-3xl font-bold text-white mt-1">{totalProblems}</p>
                    </div>
                    <div className="text-4xl">📚</div>
                  </div>
                </div>

                {/* Completed */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Completed</p>
                      <p className="text-3xl font-bold text-white mt-1">{completedProblems}</p>
                    </div>
                    <div className="text-4xl">✅</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Progress</p>
                      <p className="text-3xl font-bold text-white mt-1">{completionRate}%</p>
                    </div>
                    <div className="text-4xl">🎯</div>
                  </div>
                </div>

                {/* Streak */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Level</p>
                      <p className="text-3xl font-bold text-white mt-1">{Math.floor(completedProblems / 10) + 1}</p>
                    </div>
                    <div className="text-4xl">⚡</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Overall Progress</span>
                  <span className="text-gray-400">
                    {completedProblems}/{totalProblems}
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-400 to-white transition-all duration-1000 ease-out"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Filters and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 max-w-5xl mx-auto">
            <div className="flex-1">
              <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </div>
            <div className="lg:w-48">
              <DifficultyFilter selectedDifficulty={selectedDifficulty} onDifficultyChange={setSelectedDifficulty} />
            </div>
            <button
              onClick={toggleAllSections}
              className="px-8 py-3 bg-white/10 backdrop-blur-xl text-white font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center gap-3 hover:scale-105"
            >
              <span className="text-xl">{allCollapsed ? "📖" : "📕"}</span>
              {allCollapsed ? "Expand All" : "Collapse All"}
            </button>
          </div>
        </header>

        {/* Enhanced Main Content */}
        <main className="container mx-auto px-4 pb-8">
          <div className="space-y-6 max-w-6xl mx-auto">
            {data.map((step, idx) => {
              const filteredProblems = filterProblems(step.problems)
              if (filteredProblems.length === 0) return null

              const completedCount = step.problems.filter((_, probIdx) => checked[getProblemKey(idx, probIdx)]).length
              const totalCount = step.problems.length
              const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
              const isCollapsed = collapsedSections[idx] || false

              return (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/5"
                >
                  {/* Enhanced Section Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-white/5 transition-all duration-200"
                    onClick={() => toggleSection(idx)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl transition-transform duration-200 text-white">
                            {isCollapsed ? "▶️" : "🔽"}
                          </div>
                          <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                            <span className="font-medium">
                              {completedCount}/{totalCount}
                            </span>
                          </div>
                          <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-gray-400 to-white transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400 font-medium">{Math.round(progressPercentage)}%</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Enhanced Problems List */}
                  {!isCollapsed && (
                    <div className="border-t border-white/10">
                      <div className="p-6 space-y-3">
                        {filteredProblems.map((problem) => {
                          const originalIndex = step.problems.findIndex((p) => p.title === problem.title)
                          const problemKey = getProblemKey(idx, originalIndex)
                          const isChecked = checked[problemKey] || false

                          const getDifficultyColor = (difficulty?: string) => {
                            switch (difficulty?.toLowerCase()) {
                              case "easy":
                                return "text-gray-300 bg-gray-700/50 border-gray-600"
                              case "medium":
                                return "text-white bg-gray-600/50 border-gray-500"
                              case "hard":
                                return "text-white bg-gray-800/50 border-gray-400"
                              default:
                                return "text-gray-400 bg-gray-800/50 border-gray-700"
                            }
                          }

                          const renderLink = (href: string | undefined, text: string, icon: string) => {
                            if (!href) return null;
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 p-3 text-gray-400 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg hover:scale-110 flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {icon === "🔗" ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                ) : (
                                  <span className="text-lg">{icon}</span>
                                )}
                                <span className="hidden sm:inline">{text}</span>
                              </a>
                            );
                          };

                          return (
                            <div
                              key={problemKey}
                              className={`group flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                                isChecked
                                  ? "bg-white/10 border-white/20 hover:bg-white/15"
                                  : "bg-white/5 border-white/10 hover:bg-white/10"
                              }`}
                            >
                              {/* Enhanced Checkbox */}
                              {user && (
                                <button
                                  onClick={() => handleCheck(problemKey, !isChecked)}
                                  className="flex-shrink-0 transition-all duration-200 hover:scale-110"
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                      isChecked
                                        ? "bg-white border-white text-black"
                                        : "border-gray-400 hover:border-white"
                                    }`}
                                  >
                                    {isChecked && <span className="text-sm">✓</span>}
                                  </div>
                                </button>
                              )}

                              {/* Enhanced Problem Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3
                                    className={`font-medium transition-all duration-200 ${
                                      isChecked
                                        ? "text-gray-400 line-through opacity-75"
                                        : "text-white group-hover:text-gray-200"
                                    }`}
                                  >
                                    {problem.title}
                                  </h3>
                                  {problem.difficulty && (
                                    <span
                                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}
                                    >
                                      {problem.difficulty}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm">
                                  {problem.resource && (
                                    <span className="text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full border border-gray-700">
                                      Resource: {problem.resource}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Enhanced External Links */}
                              <div className="flex-shrink-0 flex gap-2">
                                {renderLink(problem.url, "URL", "🔗")}
                                {renderLink(problem.practice, "Practice", "📝")}
                                {renderLink(problem.solve, "Solve", "💡")}
                                {renderLink(problem.revision, "Leetcode", "👩🏻‍💻")}
                                {renderLink(problem.note, "Note", "🗒️")}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Enhanced Empty State */}
          {data.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🤔</div>
              <h3 className="text-2xl font-bold text-white mb-4">No problems found</h3>
              <p className="text-gray-400 text-lg mb-8">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedDifficulty("All")
                }}
                className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>

        {/* Enhanced Footer */}
        <footer className="text-center py-8 text-gray-500">
          <div className="container mx-auto px-4">
            <p className="text-sm">Master your coding journey • {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Index