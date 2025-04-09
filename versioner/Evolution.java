package versioner;

/**
 * Defines levels for which the 
 * semantic version should evolve
 *
 * Macro - Major
 * Proxy - Minor
 * Micro - Patch
 */
public enum Evolution {
  Macro ("MACRO"),
  Proxy ("PROXY"),
  Micro ("MICRO");

  private final String evolutionType;

  Evolution(String evolutionType) {
    this.evolutionType = evolutionType;
  }

  public String evolutionType() {
    return this.evolutionType;
  }
}
