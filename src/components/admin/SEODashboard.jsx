// frontend/src/components/admin/SEODashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Form,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getSeoDashboard,
  getKeywordRankings,
  getKeywordSuggestions,
  getKeywordCannibalization,
  analyzeKeywordDifficulty,
} from "../../redux/slices/seoSlice";
import {
  TrendingUp,
  TrendingDown,
  Search,
  BarChart3,
  Users,
  MousePointer,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import "../../styles/pages/SEODashboard.css";

const SEODashboard = () => {
  const dispatch = useDispatch();
  const {
    dashboard,
    rankings,
    keywordSuggestions,
    cannibalization,
    keywordAnalysis,
    isLoading,
  } = useSelector((state) => state.seo);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState("");

  // Fetch data on mount
  useEffect(() => {
    dispatch(getSeoDashboard());
    dispatch(getKeywordRankings());
    dispatch(getKeywordSuggestions());
    dispatch(getKeywordCannibalization());
  }, [dispatch]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAnalyzeKeyword = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }
    await dispatch(analyzeKeywordDifficulty(searchKeyword)).unwrap();
    setSelectedKeyword(searchKeyword);
    toast.success(`Analyzed keyword: ${searchKeyword}`);
  };

  // ============================================
  // HELPERS
  // ============================================

  const getScoreColor = (score) => {
    if (score >= 80) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") return <ArrowUp size={14} className="text-success" />;
    if (trend === "down")
      return <ArrowDown size={14} className="text-danger" />;
    return <Minus size={14} className="text-muted" />;
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty >= 60) return "#EF4444";
    if (difficulty >= 40) return "#F59E0B";
    return "#10B981";
  };

  const getDifficultyLabel = (difficulty) => {
    if (difficulty >= 60) return "High";
    if (difficulty >= 40) return "Medium";
    return "Low";
  };

  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading && !dashboard) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading SEO Dashboard...</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  const data = dashboard?.data || {};

  return (
    <div className="seo-dashboard">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>SEO Dashboard</h1>
          <p>Real-time SEO performance and analytics</p>
        </div>
        <Button
          variant="outline-secondary"
          onClick={() => {
            dispatch(getSeoDashboard());
            dispatch(getKeywordRankings());
            toast.success("Refreshing dashboard...");
          }}
          disabled={isLoading}
        >
          <RefreshCw size={18} className={isLoading ? "spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Main Score Card */}
      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card className="seo-score-card">
            <Card.Body>
              <div className="score-circle">
                <svg viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#2a2a2a"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={getScoreColor(data.score?.score || 0)}
                    strokeWidth="12"
                    strokeDasharray="339.292"
                    strokeDashoffset={
                      339.292 - (339.292 * (data.score?.score || 0)) / 100
                    }
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="score-text">
                  <span className="score-number">
                    {data.score?.score || 0}%
                  </span>
                  <span className="score-label">
                    {getScoreLabel(data.score?.score || 0)}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Row className="g-3">
            {data.score?.metrics?.map((metric, index) => (
              <Col md={4} key={index}>
                <Card className="metric-card">
                  <Card.Body>
                    <div className="metric-header">
                      <span className="metric-name">{metric.name}</span>
                      <Badge
                        bg={
                          metric.score >= 80
                            ? "success"
                            : metric.score >= 50
                              ? "warning"
                              : "danger"
                        }
                      >
                        {metric.score}%
                      </Badge>
                    </div>
                    <div className="metric-bar">
                      <div
                        className="metric-bar-fill"
                        style={{
                          width: `${metric.score}%`,
                          background: getScoreColor(metric.score),
                        }}
                      />
                    </div>
                    <small className="text-muted">{metric.details}</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Analytics Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-icon">
                <TrendingUp size={24} />
              </div>
              <div className="analytics-info">
                <span className="analytics-value">
                  {formatNumber(data.traffic?.traffic?.organic || 0)}
                </span>
                <span className="analytics-label">Organic Traffic</span>
                <span
                  className={`analytics-trend ${data.traffic?.trending?.organic > 0 ? "positive" : "negative"}`}
                >
                  {data.traffic?.trending?.organic > 0 ? "↑" : "↓"}{" "}
                  {Math.abs(data.traffic?.trending?.organic || 0)}%
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-icon">
                <MousePointer size={24} />
              </div>
              <div className="analytics-info">
                <span className="analytics-value">
                  {data.ctr?.overallCTR || 0}%
                </span>
                <span className="analytics-label">Click-Through Rate</span>
                <span
                  className={`analytics-trend ${data.ctr?.trend === "up" ? "positive" : "negative"}`}
                >
                  {data.ctr?.trend === "up" ? "↑" : "↓"} 0.3%
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-icon">
                <FileText size={24} />
              </div>
              <div className="analytics-info">
                <span className="analytics-value">
                  {data.indexed?.indexed || 0}
                </span>
                <span className="analytics-label">Indexed Pages</span>
                <span className="analytics-trend positive">
                  ↑ {data.indexed?.coverage || 0}% coverage
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="analytics-card">
            <Card.Body>
              <div className="analytics-icon">
                <Users size={24} />
              </div>
              <div className="analytics-info">
                <span className="analytics-value">
                  {data.traffic?.conversions || 0}
                </span>
                <span className="analytics-label">Conversions</span>
                <span className="analytics-trend positive">
                  ↑ {data.traffic?.conversionRate || 0}% CR
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Keyword Rankings */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="rankings-card">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">🔑 Keyword Rankings</h5>
                <Badge bg="info">
                  {data.rankings?.totalKeywords || 0} Keywords
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="rankings-table">
                  <thead>
                    <tr>
                      <th>Keyword</th>
                      <th>Position</th>
                      <th>Trend</th>
                      <th>Search Volume</th>
                      <th>Difficulty</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rankings?.keywords?.map((keyword, index) => (
                      <tr key={index}>
                        <td>{keyword.keyword}</td>
                        <td>
                          <span className="position-badge">
                            #{keyword.position}
                          </span>
                        </td>
                        <td>{getTrendIcon(keyword.trend)}</td>
                        <td>{formatNumber(keyword.searchVolume)}</td>
                        <td>
                          <Badge
                            style={{
                              background: getDifficultyColor(
                                keyword.difficulty,
                              ),
                              color: "#fff",
                            }}
                          >
                            {getDifficultyLabel(keyword.difficulty)}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => {
                              setSearchKeyword(keyword.keyword);
                              dispatch(
                                analyzeKeywordDifficulty(keyword.keyword),
                              );
                            }}
                          >
                            <Search size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Keyword Cannibalization */}
          <Card className="cannibalization-card">
            <Card.Header>
              <h5 className="mb-0">⚠️ Keyword Cannibalization</h5>
            </Card.Header>
            <Card.Body>
              {cannibalization?.data?.issues?.length > 0 ? (
                cannibalization.data.issues.map((issue, index) => (
                  <div key={index} className="cannibalization-item">
                    <div className="cannibalization-header">
                      <span className="keyword">{issue.keyword}</span>
                      <Badge
                        bg={issue.severity === "high" ? "danger" : "warning"}
                      >
                        {issue.count} pages
                      </Badge>
                    </div>
                    <div className="cannibalization-pages">
                      {issue.pages.map((page, i) => (
                        <span key={i} className="page-link">
                          {page}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckCircle size={32} color="#10B981" />
                  <p className="text-muted mt-2">No cannibalization detected</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Keyword Research Section */}
      <Row className="g-4">
        <Col lg={6}>
          <Card className="keyword-research-card">
            <Card.Header>
              <h5 className="mb-0">🔍 Keyword Research</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAnalyzeKeyword}>
                <Row>
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      placeholder="Enter keyword to analyze..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </Col>
                  <Col md={4}>
                    <Button type="submit" variant="danger" className="w-100">
                      <Search size={18} /> Analyze
                    </Button>
                  </Col>
                </Row>
              </Form>

              {keywordAnalysis && (
                <div className="keyword-analysis mt-4">
                  <h6 className="text-light">📊 Analysis Results</h6>
                  <div className="analysis-grid">
                    <div className="analysis-item">
                      <span className="label">Difficulty</span>
                      <span
                        className="value"
                        style={{
                          color: getDifficultyColor(keywordAnalysis.difficulty),
                        }}
                      >
                        {getDifficultyLabel(keywordAnalysis.difficulty)} (
                        {keywordAnalysis.difficulty})
                      </span>
                    </div>
                    <div className="analysis-item">
                      <span className="label">Search Volume</span>
                      <span className="value">
                        {formatNumber(keywordAnalysis.searchVolume)}
                      </span>
                    </div>
                    <div className="analysis-item">
                      <span className="label">Competition</span>
                      <span className="value">
                        {keywordAnalysis.competition}
                      </span>
                    </div>
                    <div className="analysis-item">
                      <span className="label">CPC</span>
                      <span className="value">${keywordAnalysis.cpc}</span>
                    </div>
                  </div>

                  {keywordAnalysis.longTailSuggestions && (
                    <div className="long-tail-suggestions mt-3">
                      <small className="text-muted">
                        💡 Long-tail suggestions:
                      </small>
                      <ul className="suggestions-list">
                        {keywordAnalysis.longTailSuggestions.map(
                          (suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="suggestions-card">
            <Card.Header>
              <h5 className="mb-0">💡 Keyword Suggestions</h5>
            </Card.Header>
            <Card.Body>
              {keywordSuggestions?.data?.suggestions?.map(
                (suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <div className="suggestion-info">
                      <span className="keyword">{suggestion.keyword}</span>
                      <div className="suggestion-metrics">
                        <span className="metric">
                          Volume: {formatNumber(suggestion.searchVolume)}
                        </span>
                        <span
                          className="metric"
                          style={{
                            color: getDifficultyColor(suggestion.difficulty),
                          }}
                        >
                          Difficulty:{" "}
                          {getDifficultyLabel(suggestion.difficulty)}
                        </span>
                        <span className="metric">
                          Competition: {suggestion.competition}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => {
                        setSearchKeyword(suggestion.keyword);
                        dispatch(analyzeKeywordDifficulty(suggestion.keyword));
                      }}
                    >
                      <Search size={14} />
                    </Button>
                  </div>
                ),
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SEODashboard;
