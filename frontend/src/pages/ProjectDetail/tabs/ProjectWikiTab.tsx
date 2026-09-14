import { Plus, FileText } from "lucide-react";

export default function ProjectWikiTab() {
  return (
    <div className="tab-pane active fade-in">
      <div className="wiki-container">
        <div className="wiki-sidebar">
          <div className="wiki-sidebar-header">
            <h4>Sayfalar</h4>
            <button className="icon-button"><Plus size={16} /></button>
          </div>
          <ul className="wiki-page-list">
            <li className="active"><FileText size={14} /> Genel Kurallar</li>
            <li><FileText size={14} /> Toplantı Notları</li>
            <li><FileText size={14} /> Tasarım Kılavuzu</li>
          </ul>
        </div>
        
        <div className="wiki-content-area">
          <div className="wiki-editor-mock">
            <h1 className="wiki-title">Genel Kurallar</h1>
            <p className="wiki-text">Bu alanda departmanınıza veya projenize özel dokümantasyon, kurallar ve yönergeler yer alacaktır.</p>
            <p className="wiki-text">Notion benzeri bir rich-text editörü (zengin metin düzenleyici) buraya entegre edilecek.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
