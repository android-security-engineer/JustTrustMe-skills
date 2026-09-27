import { githubUrl } from '../content'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>JustTrustMe</h4>
          <p>
            面向授权安全测试的 Android SSL 校验杀手 —— Xposed 模块，让 MITM 审计畅通无阻。
            本项目是 <code style={{ fontFamily: 'var(--mono)' }}>just.trust.me.Main</code> 的
            Agent Skill 化改造仓库，官网与产品逻辑同源。
          </p>
          <div className="warn">
            ⚠ 仅限授权测试。对未授权目标使用属违法行为，与本项目无关。
          </div>
        </div>
        <div>
          <h4>链接</h4>
          <ul>
            <li>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                GitHub · 上游仓库
              </a>
            </li>
            <li>
              <a href={githubUrl + '/issues'} target="_blank" rel="noopener noreferrer">
                Issues · 上报新库覆盖
              </a>
            </li>
            <li>
              <a href="#coverage">Hook 覆盖面</a>
            </li>
            <li>
              <a href="#install">安装步骤</a>
            </li>
          </ul>
        </div>
        <div className="copy">
          JustTrustMe · 基于上游 Fuzion24/JustTrustMe · 页面文案与实现一一对应
        </div>
      </div>
    </footer>
  )
}
